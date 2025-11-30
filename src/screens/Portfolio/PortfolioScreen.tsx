import React, { useEffect, useMemo, useState } from 'react'
import {
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

import {
	useGetHbFreeMoneyByUserIdMutation,
	useGetHbDealsByUserIdMutation,
} from '@/api/legacyAdapterApi'
import {
	useGetUserDealsQuery,
	useGetVPAdvancedQuery,
	useGetInvestedSumQuery,
} from '@/api/marketsApi'
import TradeIcon from '@/assets/trade_black.svg'
import FormInput from '@/components/FormInput'
import PrimaryButton from '@/components/PrimaryButton'
import Select from '@/components/Select'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'
import LinearGradient from 'react-native-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import PortfolioChart, { getDateRange } from './components/PortfolioChart'
import PortfolioPieChart from './components/PortfolioPieChart'
import ReloadIcon from '@/assets/reload.svg'

const PortfolioScreen = () => {
	const navigation = useNavigation<any>()
	const insets = useSafeAreaInsets()
	const { user } = useAuth()
	const [selectedCurrency, setSelectedCurrency] = useState('')
	const [range, setRange] = useState<'1D' | '1W' | '1M' | '6M' | '1Y'>('1M')

	// 🎯 обновляем даты при смене периода
	const { startDate, endDate } = useMemo(() => getDateRange(range), [range])

	const [
		getHbFreeMoneyByUserId,
		{
			data: freeMoney,
			isLoading: freeMoneyLoading,
			error: freeMoneyError,
			isError: freeMoneyIsError,
		},
	] = useGetHbFreeMoneyByUserIdMutation()

	const {
		data: userDeals,
		isLoading: isDealsLoading,
		error: dealsError,
		isError: dealsIsError,
		refetch: refetchDeals,
	} = useGetUserDealsQuery({
		p_userId: user?.oracleClientId,
	})

	const handleRetry = () => {
		if (user?.oracleClientId) {
			getHbFreeMoneyByUserId({ userId: user?.oracleClientId })
		}
		refetchDeals()
	}

	useEffect(() => {
		if (user?.oracleClientId) {
			getHbFreeMoneyByUserId({ userId: user?.oracleClientId })
		}
	}, [user?.oracleClientId])

	const currencyGroups = useMemo(() => {
		if (!Array.isArray(freeMoney)) return []

		const groups: { [key: string]: number } = {}
		freeMoney.forEach((item: any) => {
			if (item.currency && typeof item.freeAmount === 'number') {
				groups[item.currency] = (groups[item.currency] || 0) + item.freeAmount
			}
		})

		return Object.entries(groups).map(([currency, amount]) => ({
			currency,
			amount,
		}))
	}, [freeMoney])

	const selectOptions = useMemo(() => {
		return currencyGroups.map(item => ({
			value: item.currency,
			label: `${item.amount.toLocaleString('ru-RU', {
				minimumFractionDigits: 2,
			})} ${item.currency}`,
		}))
	}, [currencyGroups])

	const nowForVp = new Date()
	const startForVp = new Date(nowForVp)
	startForVp.setDate(nowForVp.getDate() - 7)
	const vpStartDate = startForVp.toISOString().slice(0, 10)
	const vpEndDate = nowForVp.toISOString().slice(0, 10)

	const {
		data: marketVpData,
		isLoading: isVpLoading,
		error: vpError,
		isError: vpIsError,
		refetch: refetchVp,
	} = useGetVPAdvancedQuery({
		p_userId: user?.oracleClientId,
		startDate: startDate,
		endDate: endDate,
	})

	const { data: investedSumData } = useGetInvestedSumQuery({
		p_userId: user?.oracleClientId,
	})

	const [
		getHbDealsByUserId,
		{ data: dealsData, isLoading: dealsLoadingLegacy },
	] = useGetHbDealsByUserIdMutation()

	useEffect(() => {
		if (user?.oracleClientId) {
			getHbDealsByUserId({
				p_userId: user?.oracleClientId,
			})
		}
	}, [user?.oracleClientId])

	const investedSum = useMemo(() => {
		return (
			dealsData
				?.filter((item: any) => item.deal_kind_id === 1)
				.reduce((acc: number, item: any) => acc + (item.amount || 0), 0) ?? 0
		)
	}, [dealsData])

	useEffect(() => {
		if (currencyGroups.length > 0 && !selectedCurrency) {
			setSelectedCurrency(currencyGroups[0].currency)
		}
	}, [currencyGroups, selectedCurrency])

	const selectedCurrencyData = currencyGroups.find(
		c => c.currency === selectedCurrency
	)
	const freeAmount = selectedCurrencyData?.amount ?? 0
	const currency = selectedCurrencyData?.currency ?? ''

	const totalValue = useMemo(() => {
		if (!Array.isArray(userDeals)) return 0
		return userDeals.reduce(
			(sum, d) => sum + (d.free_quantity ?? 0) * (d.latest_price ?? 0),
			0
		)
	}, [userDeals])

	const returnByIsin: Record<string, number> = useMemo(() => {
		const positions = (marketVpData as any)?.positions ?? []
		const map: Record<string, number> = {}
		positions.forEach((p: any) => {
			if (p?.isin && typeof p?.return_percent === 'number') {
				map[p.isin] = p.return_percent
			}
		})
		return map
	}, [marketVpData])

	const pieData = useMemo(() => {
		if (!Array.isArray(userDeals) || totalValue <= 0) return []

		const computed = userDeals
			.map(deal => {
				const price = Number(deal.latest_price) || 0
				const qty = Number(deal.free_quantity) || 0
				const amount = qty * price
				const share = (amount / totalValue) * 100
				return { deal, amount, share }
			})
			.filter(x => x.share > 0)
			.sort((a, b) => b.share - a.share)

		const MAX_SLICES = 6
		if (computed.length <= MAX_SLICES) {
			return computed.map(x => ({
				label: x.deal.ticker || '—',
				value: x.amount,
				share: x.share,
			}))
		}

		const head = computed.slice(0, MAX_SLICES - 1)
		const rest = computed.slice(MAX_SLICES - 1)
		const restAmount = rest.reduce((s, x) => s + x.amount, 0)
		const aggregated = [
			...head.map(x => ({
				label: x.deal.ticker || '—',
				value: x.amount,
				share: x.share,
			})),
			{
				label: 'Остальные',
				value: restAmount,
				share: (restAmount / totalValue) * 100,
			},
		]
		return aggregated
	}, [userDeals, totalValue])

	const hasError = freeMoneyIsError || dealsIsError
	const isLoading = freeMoneyLoading || isDealsLoading

	if (hasError && !isLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<LinearGradient
					colors={['#091F44', '#3376F6']}
					style={StyleSheet.absoluteFill}
					start={{ x: 0, y: 0 }}
					end={{ x: 0, y: 1 }}
				/>
				<View style={styles.overlay} />

				<View style={[styles.content, { paddingTop: insets.top + 50 }]}>
					<View style={styles.errorContainer}>
						<Text style={styles.errorTitle}>Что-то пошло не так</Text>
						<Text style={styles.errorSubtitle}>
							Не удалось загрузить данные портфеля. Попробуйте обновить
							страницу.
						</Text>

						<TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
							<ReloadIcon />
							<Text style={styles.retryButtonText}>Обновить</Text>
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient
				colors={['#091F44', '#3376F6']}
				style={StyleSheet.absoluteFill}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
			/>
			<View style={styles.overlay} />
			<ScrollView
				contentContainerStyle={[
					styles.content,
					{ paddingBottom: insets.bottom + 30 },
				]}
			>
				<View style={styles.freeBlock}>
					<Text style={styles.label}>Свободные средства</Text>
					{freeMoneyLoading ? (
						<View style={styles.loadingContainer}>
							<Text style={styles.loadingText}>Загрузка...</Text>
						</View>
					) : freeMoneyIsError ? (
						<View style={styles.errorContainer}>
							<Text style={styles.errorText}>Ошибка загрузки</Text>
							<TouchableOpacity
								style={styles.retryButton}
								onPress={() =>
									getHbFreeMoneyByUserId({ userId: user?.oracleClientId })
								}
							>
								<Text style={styles.retryText}>Повторить</Text>
							</TouchableOpacity>
						</View>
					) : (
						<Select
							value={selectedCurrency}
							options={selectOptions}
							onSelect={setSelectedCurrency}
							placeholder='Выберите валюту'
						/>
					)}
				</View>

				<PortfolioChart
					investedSum={investedSum}
					investedSumData={investedSumData}
					currency={(marketVpData as any)?.portfolio_currency}
					marketVpData={marketVpData}
					range={range}
					onRangeChange={setRange}
				/>

				<View style={styles.nowWrapper}>
					<TouchableOpacity
						style={styles.marketButton}
						onPress={() => navigation.navigate('Trade')}
					>
						<TradeIcon />
						<Text style={styles.marketBtnText}>К рынкам</Text>
					</TouchableOpacity>

					<PrimaryButton
						title='Как пополнить счет?'
						onPress={() => navigation.navigate('FundAccount')}
					/>
				</View>

				<PortfolioPieChart data={pieData} />

				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Мои бумаги</Text>
				</View>

				<View style={styles.stockList}>
					{isDealsLoading ? (
						<Text style={{ color: '#9AA4B1', textAlign: 'center' }}>
							Загрузка...
						</Text>
					) : dealsIsError ? (
						<View style={styles.dealsErrorContainer}>
							<Text style={styles.errorText}>
								Не удалось загрузить данные по бумагам
							</Text>
							<TouchableOpacity
								style={styles.retryButton}
								onPress={() => refetchDeals()}
							>
								<Text style={styles.retryText}>Повторить</Text>
							</TouchableOpacity>
						</View>
					) : userDeals?.length ? (
						userDeals.map((deal, idx) => {
							const price = Number(deal.latest_price) || 0
							const qty = Number(deal.free_quantity) || 0
							const amount = qty * price
							const share = totalValue > 0 ? (amount / totalValue) * 100 : 0
							const sincePurchase = returnByIsin[deal.isin] ?? null
							return (
								<TouchableOpacity
									key={idx}
									style={styles.stockCard}
									onPress={() =>
										navigation.navigate('PortfolioDetail', {
											item: {
												id: idx.toString(),
												title: deal.security_name,
												symbol: deal.ticker,
												price: deal.latest_price,
												quantity: deal.free_quantity,
												currency: deal.currency,
												isin: deal.isin,
											},
										})
									}
								>
									<View style={styles.stockHeader}>
										<View style={styles.logoAndName}>
											<View style={styles.logoCircle}>
												<Text style={styles.logoLetter}>
													{deal.ticker.charAt(0)}
												</Text>
											</View>
											<View style={{ marginLeft: 12 }}>
												<Text style={styles.stockName}>{deal.ticker}</Text>
												<Text style={styles.source}>
													{deal.security_name || 'Без названия'}
												</Text>
											</View>
										</View>
										<View>
											<Text style={styles.percent}>
												{share > 0 ? `${share.toFixed(1)}%` : '—'}
											</Text>
											<Text style={styles.percentLabel}>Доля</Text>
										</View>
									</View>

									<View style={styles.stockFooter}>
										<Text style={styles.period}>С момента покупки</Text>
										<Text
											style={[
												styles.growth,
												{
													color:
														sincePurchase === null
															? '#9AA4B1'
															: sincePurchase >= 0
															? '#00E28A'
															: '#FF5C5C',
												},
											]}
										>
											{sincePurchase === null
												? '—'
												: `${sincePurchase.toFixed(2)}%`}
										</Text>
									</View>
								</TouchableOpacity>
							)
						})
					) : (
						<Text style={{ color: '#9AA4B1', textAlign: 'center' }}>
							Нет данных по бумагам
						</Text>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}

export default PortfolioScreen

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#0D1A38' },
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.15)',
	},
	content: { padding: 16 },
	freeBlock: { marginBottom: 20 },
	label: {
		color: '#9AA4B1',
		fontSize: 14,
		marginBottom: 8,
		fontWeight: '500',
	},
	loadingContainer: {
		backgroundColor: '#2A3B55',
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderWidth: 1,
		borderColor: '#334363',
	},
	loadingText: {
		color: '#9AA4B1',
		fontSize: 16,
		textAlign: 'center',
	},
	errorContainer: {
		backgroundColor: '#2A3B55',
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderWidth: 1,
		borderColor: '#334363',
		alignItems: 'center',
		gap: 12,
	},
	dealsErrorContainer: {
		backgroundColor: 'rgba(250,250,250,0.05)',
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 20,
		alignItems: 'center',
		gap: 12,
	},
	errorText: {
		color: '#FF5C5C',
		fontSize: 14,
		textAlign: 'center',
		fontWeight: '500',
	},
	retryButton: {
		backgroundColor: 'rgba(255,255,255,0.1)',
		borderRadius: 8,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		paddingVertical: 8,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.2)',
	},
	retryText: {
		color: 'white',
		fontSize: 14,
		fontWeight: '500',
	},
	errorTitle: {
		color: 'white',
		fontSize: 24,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 12,
	},
	errorSubtitle: {
		color: 'white',
		fontSize: 16,
		textAlign: 'center',
		lineHeight: 22,
		marginBottom: 24,
		opacity: 0.9,
	},
	retryButtonText: {
		color: '#000',
		fontSize: 16,
		fontWeight: '600',
	},
	marketButton: {
		width: '100%',
		height: 48,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 16,
		backgroundColor: '#fff',
		borderRadius: 20,
	},
	marketBtnText: { color: '#000', fontWeight: '600', fontSize: 16 },
	nowWrapper: {
		marginTop: 20,
		marginBottom: 30,
		alignItems: 'center',
		gap: 12,
	},
	sectionHeader: {
		marginTop: 44,
		marginBottom: 12,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	sectionTitle: { color: 'white', fontSize: 18, fontWeight: '600' },
	viewAll: { color: '#fff', fontSize: 14, textDecorationLine: 'underline' },
	stockList: { gap: 12 },
	stockCard: {
		backgroundColor: 'rgba(250,250,250,0.05)',
		borderRadius: 8,
		paddingHorizontal: 14,
		paddingVertical: 16,
		height: 147,
		justifyContent: 'space-between',
	},
	stockHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	logoAndName: { flexDirection: 'row', alignItems: 'center' },
	logoCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
	},
	logoLetter: { fontSize: 20, color: '#000', fontWeight: 'bold' },
	stockName: { color: 'white', fontSize: 16, fontWeight: '500' },
	source: { color: '#ffffff90', fontSize: 12, marginTop: 2 },
	percent: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		textAlign: 'right',
	},
	percentLabel: { color: '#fff', fontSize: 10, marginTop: 5 },
	stockFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 16,
	},
	period: { color: '#ffffff90', fontSize: 12 },
	growth: { color: '#00E28A', fontSize: 16, fontWeight: '600' },
})
