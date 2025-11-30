import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Dimensions,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/Ionicons'

import {
	useGetSnapshotsTodayQuery,
	useGetStockHistoryByIsinQuery,
	useGetStockIntervalsQuery,
	useGetUserDealsQuery,
} from '@/api/marketsApi'
import FormInput from '@/components/FormInput'
import QualificationRequired from '@/components/QualificationRequired'
import { useAuth } from '@/contexts/AuthContext'
import { IntervalCandle, IntervalSize } from '@/types/MarketsTypes'
import { getCurrencySymbol, normalizeDateTime } from '@/utils/formats'
import TradeCard from '../TradeCard'
import StockChart from './StockChart'
import OrderHistorySection from './OrderHistory'
import { useGetInvestmentIdeasQuery } from '@/api/investIdeasApi'
import { declension } from '@/utils/plural'

type RangeKey = '1D' | '1W' | '1M' | '6M' | '1Y'

const toISO = (d: Date) =>
	`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
		d.getDate()
	).padStart(2, '0')}`

export function buildParamsForRange(range: RangeKey): {
	intervalSize: IntervalSize
	startDate?: string
	endDate?: string
	pageSize?: number
} {
	const now = new Date()
	const end = toISO(now)

	const clone = (d: Date) => new Date(d.getTime())

	switch (range) {
		case '1D': {
			const start = clone(now)
			start.setDate(now.getDate() - 1)
			return {
				intervalSize: '1h',
				startDate: toISO(start),
				endDate: end,
				pageSize: 500,
			}
		}
		case '1W': {
			const start = clone(now)
			start.setDate(now.getDate() - 7)
			return {
				intervalSize: '5m',
				startDate: toISO(start),
				endDate: end,
				pageSize: 500,
			}
		}
		case '1M': {
			const start = clone(now)
			start.setMonth(now.getMonth() - 1)
			return {
				intervalSize: '15m',
				startDate: toISO(start),
				endDate: end,
				pageSize: 500,
			}
		}
		case '6M': {
			const start = clone(now)
			start.setMonth(now.getMonth() - 6)
			return {
				intervalSize: '1h',
				startDate: toISO(start),
				endDate: end,
				pageSize: 1000,
			}
		}
		case '1Y': {
			const start = clone(now)
			start.setFullYear(now.getFullYear() - 1)
			return {
				intervalSize: '1h',
				startDate: toISO(start),
				endDate: end,
				pageSize: 1000,
			}
		}
		default:
			return { intervalSize: '1h', pageSize: 1000 }
	}
}

type Props = {
	item: {
		id: string
		logo?: any
		title: string
		date: string
		price?: string
		growth?: string
		symbol: string
		isin?: string
		currentPrice?: number
		exchange?: any
	}
	selectedTab: string
}

export default function BondDetail({ item, selectedTab }: Props) {
	const navigation = useNavigation<NativeStackNavigationProp<any>>()
	const [range, setRange] = useState<RangeKey>('1M')
	const { user } = useAuth()

	const isinParams = useMemo(() => {
		const { startDate, endDate, pageSize } = buildParamsForRange(range)

		return {
			isin: item.isin || '',
			startDate,
			endDate,
			pageSize,
		}
	}, [range, item.isin])

	let rawData: any[] = []
	let bondInfo: any = {}
	let isLoading = false

	const refetchOpts = {
		refetchOnMountOrArgChange: true,
		refetchOnFocus: true,
		refetchOnReconnect: true,
	}

	// Если range === '1D' - используем snapshots today, иначе ISIN
	if (range === '1D') {
		if (selectedTab === 'AIX') {
			const {
				data: snapshotData,
				isLoading: isSnapshotsLoading,
				isFetching: isSnapshotsFetching,
			} = useGetSnapshotsTodayQuery(
				{ stockId: item.id, page: 1, pageSize: 20 },
				refetchOpts
			)

			rawData = snapshotData?.snapshots ?? []
			isLoading = isSnapshotsLoading || isSnapshotsFetching
		} else if (selectedTab === 'Global') {
			const {
				data: intervalsData,
				isLoading: isIntervalsLoading,
				isFetching: isIntervalsFetching,
			} = useGetStockIntervalsQuery(
				{
					symbol: item.symbol,
					intervalSize: '1h',
					pageSize: 20,
				},
				refetchOpts
			)

			rawData = intervalsData ?? []
			isLoading = isIntervalsLoading || isIntervalsFetching
		} else {
			// Для 1D используем snapshots today
			const {
				data: snapshotData,
				isLoading: isSnapshotsLoading,
				isFetching: isSnapshotsFetching,
			} = useGetSnapshotsTodayQuery(
				{ stockId: item.id, page: 1, pageSize: 20 },
				refetchOpts
			)

			rawData = snapshotData?.snapshots ?? []
			isLoading = isSnapshotsLoading || isSnapshotsFetching
		}
	} else {
		// Для диапазонов >1D используем ISIN эндпоинт
		const {
			data: historyData,
			isLoading: isHistoryLoading,
			isFetching: isHistoryFetching,
		} = useGetStockHistoryByIsinQuery(isinParams, refetchOpts)

		rawData = (historyData?.data?.history ?? []).slice().reverse()
		bondInfo = historyData?.data?.stock ?? {}
		isLoading = isHistoryLoading || isHistoryFetching
	}

	function aggregateDataByRange(data: any[], range: RangeKey) {
		if (!data?.length) return []

		const getTime = (item: any) =>
			item?.close_time ||
			item?.time ||
			item?.closeTime ||
			item?.timestamp ||
			(typeof item?.date === 'string' ? item.date : undefined)

		if (range === '1W' || range === '1M') {
			const grouped = new Map<string, any>()
			for (const point of data) {
				const iso = getTime(point)
				if (!iso) continue
				const d = new Date(iso)
				const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
				grouped.set(key, point)
			}
			return Array.from(grouped.values())
		}

		if (range === '6M' || range === '1Y') {
			const grouped = new Map<string, any>()
			for (const point of data) {
				const iso = getTime(point)
				if (!iso) continue
				const d = new Date(iso)

				const oneJan = new Date(d.getFullYear(), 0, 1)
				const week = Math.ceil(
					((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) /
						7
				)
				const key = `${d.getFullYear()}-W${week}`

				grouped.set(key, point)
			}
			return Array.from(grouped.values())
		}

		return data
	}

	const candlesOrdered = useMemo(() => {
		let arr: any[] = rawData ?? []
		if (!arr.length) return []

		if (selectedTab === 'AIX' && range === '1D') {
			const filtered = (rawData ?? [])
				.filter(
					(p: any) =>
						(p?.type?.toUpperCase() === 'BID' ||
							p?.type?.toUpperCase() === 'OFFER') &&
						Number(p?.price) > 0 &&
						p?.date &&
						p?.time
				)
				.map((p: any) => {
					const price = Number(p.price)
					const d = String(p.date)
					const t = String(p.time)

					const close_time = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(
						6,
						8
					)}T${t}Z`

					return {
						close: price,
						close_time,
					}
				})
				.filter(p => !isNaN(new Date(p.close_time).getTime()))
				.sort(
					(a, b) =>
						new Date(a.close_time).getTime() - new Date(b.close_time).getTime()
				)

			return filtered.map(p => ({
				close: p.close,
				time: p.close_time,
			}))
		}

		if (selectedTab === 'Global' && range === '1D') {
			return arr
				.filter((p: any) => Number(p?.close) > 0)
				.map((p: any) => ({
					close: Number(p.close),
					time: p.close_time || p.time,
				}))
				.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
		}

		arr = aggregateDataByRange(arr, range)
		return arr.map((h: any) => ({
			close: Number(h.closePrice ?? h.close ?? h.price ?? 0),
			time: h.date ?? h.time ?? h.close_time,
		}))
	}, [rawData, selectedTab, range])

	const ranges: RangeKey[] = ['1D', '1W', '1M', '6M', '1Y']

	const growthPercent = useMemo(() => {
		if (range === '1D') {
			if (item?.growth) {
				if (typeof item.growth === 'string' && item.growth.includes('%')) {
					return item.growth.replace('%', '')
				}

				return String(Number(item.growth).toFixed(2))
			}
			return null
		}

		if (!candlesOrdered || candlesOrdered.length < 2) return null

		const first = Number((candlesOrdered[0] as IntervalCandle)?.close)
		const last = Number(
			(candlesOrdered[candlesOrdered.length - 1] as IntervalCandle)?.close
		)

		if (!Number.isFinite(first) || !Number.isFinite(last) || first === 0)
			return null

		const diff = ((last - first) / first) * 100
		return diff.toFixed(2)
	}, [candlesOrdered, range, item.growth])

	const { data: userDeals } = useGetUserDealsQuery({
		p_userId: user?.oracleClientId,
	})
	const userPosition = userDeals?.find(
		(d: any) =>
			(item.isin && d.isin && item.isin === d.isin) ||
			(item.symbol && d.ticker && item.symbol === d.ticker)
	)
	const { data: investIdeasData } = useGetInvestmentIdeasQuery()

	const assetQuantity = Number(userPosition?.free_quantity ?? 0)
	const assetPrice = Number(userPosition?.latest_price ?? 0)
	const assetCurrency = userPosition?.currency ?? 'USD'

	const relatedIdea = useMemo(() => {
		if (!investIdeasData?.data || !item?.symbol) return null
		return investIdeasData.data.find((idea: any) => idea.ticker === item.symbol)
	}, [investIdeasData?.data, item.symbol])

	return (
		<SafeAreaView style={{ flex: 1, margin: -18 }}>
			<LinearGradient
				colors={['#091F44', '#3376F6']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				style={StyleSheet.absoluteFill}
			/>
			<View style={styles.overlay} />
			<ScrollView style={styles.container}>
				<View style={styles.headerWrapper}>
					<TouchableOpacity onPress={() => navigation.goBack()}>
						<Icon name='arrow-back' size={24} color='#fff' />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>{item.title}</Text>
					<View style={{ width: 24 }} />
				</View>
				<View style={styles.card}>
					<View style={styles.header}>
						<Image source={item.logo} style={styles.logo} />
						<View style={{ flex: 1 }}>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<View>
									<Text style={styles.title}>{item.title}</Text>
									<Text style={styles.subtitle}>{item.symbol}</Text>
								</View>

								<View>
									{item.currentPrice ? (
										<View>
											<Text
												style={[
													styles.lastPrice,
													{
														color: bondInfo?.maturityDate
															? '#06D6A0'
															: '#FEFEFE',
													},
												]}
											>
												{item.currentPrice}
												{getCurrencySymbol(item?.exchange?.currency)}
											</Text>
											{bondInfo?.maturityDate && (
												<Text style={{ fontSize: 10, color: '#fff' }}>
													от стоимости
												</Text>
											)}
										</View>
									) : (
										<Text style={[styles.lastPrice, { opacity: 0.6 }]}>—</Text>
									)}
								</View>
							</View>
						</View>
					</View>

					<View style={styles.priceWrapper}>
						<Text
							style={[
								styles.growth,
								Number(growthPercent) < 0
									? { color: '#FF4D4F', backgroundColor: '#4B0C14CC' }
									: { color: '#00FF8A', backgroundColor: '#045E47CC' },
							]}
						>
							{Number(growthPercent) > 0 ? '▲ ' : '▼ '}
							{growthPercent}%
						</Text>
					</View>

					<View
						style={[
							styles.chartWrapper,
							{ borderRadius: 16, overflow: 'hidden' },
						]}
					>
						<LinearGradient
							colors={['transparent', 'rgba(0,0,0,0.35)']}
							style={StyleSheet.absoluteFill}
							pointerEvents='none'
						/>

						<View style={styles.chartWrapper}>
							{candlesOrdered.length >= 2 ? (
								<StockChart
									candles={candlesOrdered.map(c => ({
										close: Number(c.close),
										time: c.time,
									}))}
									range={range}
								/>
							) : (
								<View
									style={[
										styles.noData,
										{ width: Dimensions.get('window').width - 32 },
									]}
								>
									<Icon
										name='bar-chart-outline'
										size={42}
										color='rgba(255,255,255,0.5)'
									/>
									<Text style={styles.noDataText}>
										Нет данных для выбранного периода
									</Text>
								</View>
							)}

							{isLoading && (
								<View style={styles.chartLoader} pointerEvents='none'>
									<ActivityIndicator />
								</View>
							)}
						</View>

						{isLoading && (
							<View style={styles.chartLoader} pointerEvents='none'>
								<ActivityIndicator />
							</View>
						)}
					</View>

					<View style={styles.segment}>
						{ranges.map(label => {
							const active = label === range
							return (
								<TouchableOpacity
									key={label}
									style={[
										styles.segmentItem,
										active && styles.segmentItemActive,
									]}
									onPress={() => setRange(label)}
									activeOpacity={0.8}
								>
									<Text
										style={[
											styles.segmentText,
											active && styles.segmentTextActive,
										]}
									>
										{label}
									</Text>
								</TouchableOpacity>
							)
						})}
					</View>

					{!user?.isQualified ? (
						<QualificationRequired />
					) : (
						<View>
							{bondInfo?.maturityDate && (
								<View style={styles.bondCard}>
									<View style={styles.bondRow}>
										<View style={styles.bondCol}>
											<Text style={styles.bondLabel}>
												Номинальная стоимость
											</Text>
											<View style={styles.bondInputBox}>
												<Text style={styles.bondInputValue}>
													{bondInfo?.nominalValue
														? `${bondInfo.nominalValue}$`
														: '—'}
												</Text>
											</View>
										</View>
										<View style={styles.bondCol}>
											<Text style={styles.bondLabel}>Накопленный купон</Text>
											<View style={styles.bondInputBox}>
												<Text style={styles.bondInputValue}>
													{bondInfo?.accruedCoupon
														? `${bondInfo.accruedCoupon}$`
														: '—'}
												</Text>
											</View>
										</View>
									</View>

									<View style={styles.bondRow}>
										<View style={styles.bondCol}>
											<Text style={styles.bondLabel}>Ставка купона</Text>
											<View style={styles.bondInputBox}>
												<Text style={styles.bondInputValue}>
													{bondInfo?.couponRate
														? `${bondInfo.couponRate}%`
														: '—'}
												</Text>
											</View>
										</View>
										<View style={styles.bondCol}>
											<Text style={styles.bondLabel}>Ближ. выплата купона</Text>
											<View style={styles.bondInputBox}>
												<Text style={styles.bondInputValue}>
													{bondInfo?.nextCouponDate
														? normalizeDateTime(bondInfo?.nextCouponDate)
														: '—'}
												</Text>
											</View>
										</View>
									</View>

									<View style={styles.bondRow}>
										<View style={styles.bondCol}>
											<Text style={styles.bondLabel}>Дата погашения</Text>
											<View style={styles.bondInputBox}>
												<Text style={styles.bondInputValue}>
													{bondInfo?.maturityDate
														? normalizeDateTime(bondInfo?.maturityDate)
														: '—'}
												</Text>
											</View>
										</View>
										<View style={styles.bondCol}>
											<Text style={styles.bondLabel}>Дата выпуска</Text>
											<View style={styles.bondInputBox}>
												<Text style={styles.bondInputValue}>
													{bondInfo?.issueDate
														? normalizeDateTime(bondInfo?.issueDate)
														: '—'}
												</Text>
											</View>
										</View>
									</View>

									<View style={styles.bondRow}>
										<View style={styles.bondCol}>
											<Text style={styles.bondLabel}>Частота выплат</Text>
											<View style={styles.bondInputBox}>
												<Text style={styles.bondInputValue}>
													{bondInfo?.paymentFrequency ?? '—'}
												</Text>
											</View>
										</View>
										<View style={styles.bondCol}>
											<Text style={styles.bondLabel}>Валюта</Text>
											<View style={styles.bondInputBox}>
												<Text style={styles.bondInputValue}>
													{bondInfo?.currencyId ?? '—'}
												</Text>
											</View>
										</View>
									</View>

									<Text style={styles.yieldLabel}>Текущая доходность</Text>

									<View style={[styles.bondInputBox, { alignItems: 'center' }]}>
										<Text style={styles.yieldValue}>
											{bondInfo?.yield ? `${bondInfo.yield}%` : '—'}
										</Text>
									</View>
								</View>
							)}

							<View style={styles.buttonsRow}>
								<TouchableOpacity
									style={styles.buyButton}
									onPress={() =>
										navigation.navigate('TradeOrder', {
											mode: 'buy',
											asset: {
												...item,
												logo: item?.logo,
												symbol: item?.symbol,
												name: item?.title,
												priceWithCurrency: `${item?.currentPrice} ${
													item?.exchange?.currency ?? ''
												}`,
												pricePaper: item?.currentPrice,
											},
											freeFunds: 1200,
										})
									}
								>
									<Image source={require('@/assets/import.png')} />
									<Text style={styles.buyText}>Купить</Text>
								</TouchableOpacity>
								{assetQuantity > 0 && (
									<TouchableOpacity
										style={styles.sellButton}
										onPress={() =>
											navigation.navigate('TradeOrder', {
												mode: 'sell',
												asset: {
													logo: item?.logo,
													symbol: item?.symbol,
													name: item?.title,
													priceWithCurrency: `${item?.currentPrice} ${
														item?.exchange?.currency ?? ''
													}`,
													pricePaper: item?.currentPrice,
												},
												freeFunds: 1200,
											})
										}
									>
										<Image source={require('@/assets/export.png')} />
										<Text style={styles.sellText}>Продать</Text>
									</TouchableOpacity>
								)}
							</View>

							{bondInfo?.maturityDate && (
								<View style={styles.calcBlock}>
									<Text style={styles.sectionTitle}>
										Рассчитайте потенциальную доходность
									</Text>

									<Text style={styles.calcLabel}>Если вложу:</Text>
									<View style={styles.calcInput}>
										<Text style={styles.calcInputText}>50 000.00$</Text>
									</View>

									<Text style={styles.calcLabel}>Могу заработать:</Text>
									<Text style={styles.calcProfit}>
										+56 775.41 $ <Text style={{ fontSize: 14 }}>(10%)</Text>
									</Text>

									<View style={styles.sliderTrack}>
										<View style={styles.sliderThumb} />
									</View>

									<View style={styles.sliderLabels}>
										<Text style={styles.sliderLabel}>50 000 $</Text>
										<Text style={styles.sliderLabel}>500 000 $</Text>
										<Text style={styles.sliderLabel}>1 000 000 $</Text>
									</View>

									<Text style={styles.calcNote}>
										Расчет без учета НКД. Не является индивидуальной
										инвестиционной рекомендацией.
									</Text>
								</View>
							)}

							{assetQuantity > 0 && (
								<View style={styles.assetQuantity}>
									<FormInput
										label='У вас уже есть'
										value={`${assetQuantity} ${declension(assetQuantity, [
											'бумага',
											'бумаги',
											'бумаг',
										])}`}
										disabled
									/>
									<FormInput
										label='На сумму'
										value={`${(
											assetQuantity * assetPrice
										).toLocaleString()} ${assetCurrency}`}
										disabled
									/>
								</View>
							)}
						</View>
					)}
				</View>

				{user?.isQualified && (
					<OrderHistorySection
						isin={item?.isin ?? ''}
						logo={item?.logo}
						title={item?.title}
					/>
				)}
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.2)',
	},
	chartLoader: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	headerTitle: {
		color: '#fff',
		fontSize: 16,
		fontFamily: 'Montserrat',
		fontWeight: '600',
	},
	container: { flex: 1, padding: 16 },
	headerWrapper: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingTop: 8,
		paddingBottom: 32,
	},
	card: {
		borderRadius: 16,
		// borderWidth: 3,
		// borderColor: '#091F44',
		// backgroundColor: '#091F44',
		// padding: 12,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	logo: {
		width: 76,
		height: 76,
		borderRadius: 36,
		marginRight: 12,
		backgroundColor: '#fff',
	},
	title: { color: '#fff', fontSize: 22, fontWeight: '600', marginBottom: 16 },
	subtitle: { color: '#fff', fontSize: 14 },
	ideaLinkWrapper: { marginBottom: 16 },
	ideaText: {
		flex: 1,
		color: '#06D6A0',
		borderBottomWidth: 1,
		borderBottomColor: '#06D6A0',
		fontSize: 14,
		fontWeight: '600',
		fontFamily: 'Montserrat',
	},
	lastPrice: {
		fontSize: 18,
		fontFamily: 'Montserrat',
		fontWeight: 'bold',
		textAlign: 'right',
	},
	priceWrapper: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
		gap: 16,
		marginBottom: 16,
	},
	price: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
	growth: {
		color: '#00d084',
		fontSize: 12,
		marginTop: 16,
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 12,
	},
	chartWrapper: { alignItems: 'center' },
	segment: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.25)',
		borderRadius: 12,
		padding: 6,
		marginTop: 8,
		marginBottom: 16,
	},
	segmentItem: {
		flex: 1,
		height: 34,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	segmentItemActive: {
		backgroundColor: 'rgba(255,255,255,0.12)',
	},
	segmentText: {
		color: 'rgba(255,255,255,0.75)',
		fontSize: 12,
		fontWeight: '600',
		letterSpacing: 0.3,
	},
	segmentTextActive: {
		color: '#FFFFFF',
		fontWeight: '800',
	},
	buttonsRow: { flexDirection: 'row', gap: 12 },
	buyButton: {
		flex: 1,
		height: 48,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 16,
		backgroundColor: '#fff',
		borderRadius: 20,
	},
	sellButton: {
		flex: 1,
		height: 48,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 16,
		borderColor: '#fff',
		borderWidth: 1,
		borderRadius: 20,
	},
	buyText: { color: '#000', fontWeight: '600', fontSize: 16 },
	sellText: { color: '#fff', fontWeight: '600', fontSize: 16 },
	assetQuantity: { marginTop: 36 },
	orderHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 12,
	},
	orderTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
	orderLink: { color: '#FAFAFA', fontSize: 12 },
	noData: {
		height: 295,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.05)',
		borderRadius: 16,
		alignSelf: 'stretch',
	},
	noDataText: {
		marginTop: 8,
		color: 'rgba(255,255,255,0.6)',
		fontSize: 13,
		fontWeight: '500',
	},

	bondCard: {
		marginTop: 24,
		marginBottom: 16,
	},
	sectionTitle: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '700',
		fontFamily: 'Montserrat',
		marginBottom: 16,
	},
	bondRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 12,
		gap: 12,
	},
	bondCol: {
		flex: 1,
	},
	bondLabel: {
		color: 'rgba(255,255,255,0.7)',
		fontSize: 10,
		marginBottom: 6,
		fontFamily: 'Montserrat',
	},
	bondInputBox: {
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.1)',
		borderRadius: 10,
		paddingVertical: 10,
		paddingHorizontal: 12,
	},
	bondInputValue: {
		color: '#FFFFFF',
		fontSize: 15,
		fontWeight: '600',
		fontFamily: 'Montserrat',
	},
	yieldLabel: {
		color: 'rgba(255,255,255,0.7)',
		fontSize: 13,
		textAlign: 'center',
		marginTop: 8,
		marginBottom: 6,
		fontFamily: 'Montserrat',
	},
	yieldValue: {
		color: '#FFFFFF',
		fontSize: 20,
		fontWeight: '700',
		fontFamily: 'Montserrat',
		textAlign: 'center',
	},

	calcBlock: {
		backgroundColor: 'rgba(255,255,255,0.05)',
		borderRadius: 16,
		padding: 16,
		marginTop: 24,
	},
	calcLabel: {
		color: 'rgba(255,255,255,0.7)',
		fontSize: 13,
		marginBottom: 4,
	},
	calcInput: {
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderRadius: 10,
		padding: 12,
		marginBottom: 8,
	},
	calcInputText: {
		color: '#FFFFFF',
		fontSize: 15,
		fontWeight: '500',
	},
	calcProfit: {
		color: '#06D6A0',
		fontSize: 22,
		fontWeight: '700',
		marginVertical: 8,
	},
	sliderTrack: {
		height: 4,
		backgroundColor: 'rgba(255,255,255,0.2)',
		borderRadius: 4,
		marginTop: 8,
		marginBottom: 4,
	},
	sliderThumb: {
		position: 'absolute',
		left: '10%',
		top: -4,
		width: 16,
		height: 16,
		borderRadius: 8,
		backgroundColor: '#06D6A0',
	},
	sliderLabels: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 4,
	},
	sliderLabel: {
		color: 'rgba(255,255,255,0.6)',
		fontSize: 12,
	},
	calcNote: {
		color: 'rgba(255,255,255,0.4)',
		fontSize: 11,
		marginTop: 8,
		lineHeight: 14,
		textAlign: 'center',
	},
})
