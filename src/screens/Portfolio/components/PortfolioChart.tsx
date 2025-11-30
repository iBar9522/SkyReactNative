import { useGetPortfolioMarketValueQuery } from '@/api/marketsApi'
import { useAuth } from '@/contexts/AuthContext'
import React, { useEffect, useMemo, useState } from 'react'
import {
	Dimensions,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { LineChart } from 'react-native-gifted-charts'
import ReloadIcon from '@/assets/reload.svg'
import { useGetCurrencyRateMutation } from '@/api/legacyAdapterApi'

export const getDateRange = (range: '1D' | '1W' | '1M' | '6M' | '1Y') => {
	const end = new Date()
	const start = new Date()
	switch (range) {
		case '1D':
			start.setDate(end.getDate() - 1)
			break
		case '1W':
			start.setDate(end.getDate() - 7)
			break
		case '1M':
			start.setMonth(end.getMonth() - 1)
			break
		case '6M':
			start.setMonth(end.getMonth() - 6)
			break
		case '1Y':
			start.setFullYear(end.getFullYear() - 1)
			break
	}
	return { startDate: start.toISOString(), endDate: end.toISOString() }
}

type PortfolioChartProps = {
	investedSum?: number
	investedSumData?: any
	currency?: string
	marketVpData?: any
	range: '1D' | '1W' | '1M' | '6M' | '1Y'
	onRangeChange: (r: '1D' | '1W' | '1M' | '6M' | '1Y') => void
}

export default function PortfolioChart({
	investedSum,
	investedSumData,
	currency,
	marketVpData,
	range,
	onRangeChange,
}: PortfolioChartProps) {
	const { user } = useAuth()

	const { startDate, endDate } = useMemo(() => getDateRange(range), [range])

	const {
		data: portfolioMarketValue,
		isLoading: isPmvLoading,
		isFetching: isPmvFetching,
		error: pmvError,
		isError: pmvIsError,
		refetch: refetchPmv,
	} = useGetPortfolioMarketValueQuery(
		{
			p_userId: user?.oracleClientId,
			startDate,
			endDate,
			currency: 'KZT',
		},
		{
			refetchOnMountOrArgChange: true,
			refetchOnFocus: true,
			refetchOnReconnect: true,
		}
	)

	// запрос для текущей оценки
	const today = new Date().toISOString().split('T')[0]
	const {
		data: todayPortfolioValue,
		isLoading: isTodayLoading,
		isFetching: isTodayFetching,
	} = useGetPortfolioMarketValueQuery(
		{
			p_userId: user?.oracleClientId,
			startDate: today,
			endDate: today,
			currency: 'KZT',
		},
		{
			skip: !user?.oracleClientId,
			refetchOnMountOrArgChange: false,
			refetchOnFocus: true,
		}
	)

	const [getCurrencyRate] = useGetCurrencyRateMutation()
	const [convertedData, setConvertedData] = useState<any>(null)
	const [exchangeRate, setExchangeRate] = useState<number>(1)

	useEffect(() => {
		const convertCurrency = async () => {
			if (!portfolioMarketValue || !currency || currency === 'KZT') {
				setConvertedData(portfolioMarketValue)
				setExchangeRate(1)
				return
			}

			try {
				const today = new Date().toISOString().split('T')[0]
				const res = await getCurrencyRate({
					fromCurrencyCode: 'KZT',
					toCurrencyCode: currency,
					startDate: today,
					endDate: today,
				}).unwrap()

				const rate = res?.[0]?.exchangeRate ?? 1
				setExchangeRate(rate)

				const converted = {
					...portfolioMarketValue,
					dailyValues: portfolioMarketValue.dailyValues.map((item: any) => ({
						...item,
						marketValue: Number(item.marketValue ?? 0) / rate,
					})),
				}

				setConvertedData(converted)
			} catch (err) {
				console.error('Ошибка при получении курса валют:', err)
				setConvertedData(portfolioMarketValue)
				setExchangeRate(1)
			}
		}

		convertCurrency()
	}, [portfolioMarketValue, currency])

	const handleRetry = () => {
		refetchPmv()
	}

	const pmvDaysArr = useMemo(() => {
		const arr = (convertedData as any)?.dailyValues
		return Array.isArray(arr) ? arr : []
	}, [convertedData])

	const visiblePointsByRange: Record<string, number> = {
		'1D': 80,
		'1W': 7,
		'1M': 10,
		'6M': 10,
		'1Y': 10,
	}

	const currencySymbols: Record<string, string> = {
		USD: '$',
		EUR: '€',
		KZT: '₸',
		RUB: '₽',
		GBP: '£',
		CNY: '¥',
	}

	const visibleData = useMemo(() => {
		if (!pmvDaysArr?.length) return []
		const total = pmvDaysArr.length
		const target = visiblePointsByRange[range] ?? 6
		const step = Math.max(1, Math.floor(total / target))
		return pmvDaysArr.filter((_: any, i: number) => i % step === 0)
	}, [pmvDaysArr, range])

	const chartData = useMemo(() => {
		return visibleData.map((d: any) => ({
			value: Number(d.marketValue ?? 0),
			label: formatLabel(d.date, range),
			date: new Date(d.date),
		}))
	}, [visibleData, range])

	const hasChartData = chartData.length > 0

	const profitPercent = useMemo(() => {
		if (pmvDaysArr.length < 2) return 0
		const start = Number(pmvDaysArr[0]?.marketValue ?? 0)
		const end = Number(pmvDaysArr[pmvDaysArr.length - 1]?.marketValue ?? 0)
		if (!start) return 0
		return ((end - start) / start) * 100
	}, [pmvDaysArr])

	const formatAmount = useMemo(() => {
		const formatter = new Intl.NumberFormat('ru-RU', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})
		return (value?: number, curr?: string) =>
			`${formatter.format(value ?? 0)} ${curr ?? ''}`
	}, [])

	const formatNumber = useMemo(() => {
		const formatter = new Intl.NumberFormat('ru-RU', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})
		return (value: number) => formatter.format(value)
	}, [])

	const investedSumValue = useMemo(() => {
		if (!investedSumData) return 0

		const value = investedSumData?.net_invested_capital ?? 0
		const backendCurrency = investedSumData?.currency ?? 'KZT'

		if (backendCurrency === currency) return value

		if (backendCurrency === 'KZT' && currency !== 'KZT') {
			return value / (exchangeRate || 1)
		}

		if (backendCurrency === 'USD' && currency === 'KZT') {
			return value * (exchangeRate || 1)
		}

		return value
	}, [investedSumData, currency, exchangeRate])

	const currentPortfolioValue = useMemo(() => {
		const arr = (todayPortfolioValue as any)?.dailyValues
		if (!Array.isArray(arr) || arr.length === 0) return 0
		const lastItem = arr[arr.length - 1]
		return Number(lastItem.marketValue ?? 0) / (exchangeRate ?? 1)
	}, [todayPortfolioValue, exchangeRate])

	const hasError = pmvIsError
	const isLoading = isPmvLoading || isPmvFetching

	if (hasError && !isLoading) {
		return (
			<View style={styles.container}>
				<View style={styles.errorContainer}>
					<Text style={styles.errorTitle}>Что-то пошло не так</Text>
					<Text style={styles.errorText}>
						Попробуйте перезагрузить или вернитесь позже
					</Text>
					<TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
						<ReloadIcon />
						<Text style={styles.retryText}>Повторить</Text>
					</TouchableOpacity>
				</View>
			</View>
		)
	}

	const values = hasChartData ? chartData.map(p => p.value) : [0, 1]
	const rawMin = hasChartData ? Math.min(...values) : 0
	const rawMax = hasChartData ? Math.max(...values) : 1
	const rawDiff = hasChartData ? rawMax - rawMin || 1 : 1

	const paddingFactor = range === '1D' ? 0.1 : 0.08
	const minValue = rawMin - rawDiff * paddingFactor
	const maxValue = rawMax + rawDiff * paddingFactor
	const diff = maxValue - minValue

	const normalizedData = hasChartData
		? chartData.map(p => ({
				...p,
				value: ((p.value - minValue) / diff) * 100,
		  }))
		: []

	const yMin = minValue - diff * 0.05
	const yMax = maxValue + diff * 0.05

	const noOfSections = 4
	const sectionStep = (yMax - yMin) / noOfSections
	const customYAxisLabels = hasChartData
		? Array.from({ length: noOfSections + 1 }, (_, i) => {
				const value = yMin + sectionStep * i
				const symbol = currencySymbols[currency ?? ''] || currency || ''
				return `${formatNumber(value)} ${symbol}`
		  })
		: []

	const chartWidth = normalizedData.length * (range === '1W' ? 80 : 55)

	return (
		<View style={styles.container}>
			<View style={styles.containerRow}>
				<View style={styles.titleFlex}>
					<Text style={styles.title}>Портфель</Text>
					<Text style={styles.date}>Сегодня</Text>
				</View>
				<View>
					<Text
						style={[
							styles.pricePortfolio,
							{
								color:
									marketVpData?.total_return_percent >= 0
										? '#00E28A'
										: '#FF5C5C',
							},
						]}
					>
						{((marketVpData?.total_return_percent ?? 0) * 100).toFixed(2)} %
					</Text>
					<Text style={styles.pricePortfolioLabel}>Доходность</Text>
				</View>
			</View>

			<View style={styles.rowWrapper}>
				<View style={styles.row}>
					<Text style={styles.label}>Инвестированная сумма</Text>
					<Text style={styles.price}>
						{formatAmount(investedSumValue, currency)}
					</Text>
				</View>
				<View style={styles.row}>
					<Text style={styles.label}>Текущая оценка</Text>
					<Text style={styles.price}>
						{isTodayLoading || isTodayFetching
							? 'Загрузка...'
							: formatAmount(currentPortfolioValue, currency)}
					</Text>
				</View>
			</View>

			{isLoading ? (
				<View style={styles.loadingContainer}>
					<Text style={styles.loadingText}>Загрузка данных графика...</Text>
				</View>
			) : !hasChartData ? (
				<View style={styles.noDataContainer}>
					<Text style={styles.noDataText}>
						Нет данных для выбранного периода
					</Text>
				</View>
			) : (
				<View style={styles.chartWrapper}>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{
							alignItems: 'flex-start',
							paddingLeft: 16,
							paddingRight: 16,
						}}
					>
						<LineChart
							curved
							areaChart
							data={normalizedData}
							height={240}
							width={chartWidth}
							thickness={2}
							color='#3D8BFF'
							startFillColor='#3D8BFF'
							endFillColor='#0062CC'
							startOpacity={0.4}
							endOpacity={0.05}
							showVerticalLines={false}
							rulesType='none'
							hideDataPoints
							yAxisThickness={0}
							xAxisThickness={0}
							backgroundColor='transparent'
							yAxisTextStyle={styles.yAxis}
							xAxisLabelTextStyle={styles.xAxis}
							xAxisLabelsHeight={20}
							yAxisLabelWidth={100}
							verticalLinesColor='rgba(255,255,255,0.1)'
							initialSpacing={25}
							endSpacing={20}
							yAxisOffset={0}
							maxValue={100}
							noOfSections={noOfSections}
							yAxisLabelTexts={customYAxisLabels}
							adjustToWidth={false}
							scrollAnimation
							pointerConfig={{
								showPointerStrip: true,
								activatePointersOnLongPress: true,
								pointerStripColor: 'rgba(255,255,255,0.3)',
								pointerStripWidth: 1,
								pointerColor: '#3D8BFF',
								radius: 5,
								autoAdjustPointerLabelPosition: true,
								pointerLabelWidth: 120,
								pointerLabelHeight: 60,
								pointerVanishDelay: 0,
								pointerStripUptoDataPoint: true,
								pointerLabelComponent: (items: any) => {
									const item = items?.[0]
									if (!item) return null

									let dateLabel = ''
									if (range === '1Y') {
										dateLabel = item.date?.toLocaleDateString('ru-RU', {
											month: 'short',
											year: 'numeric',
										})
									} else if (range === '1D') {
										const d = item.date
										const datePart = d?.toLocaleDateString('ru-RU', {
											day: '2-digit',
											month: 'short',
										})
										const timePart = d?.toLocaleTimeString('ru-RU', {
											hour: '2-digit',
											minute: '2-digit',
										})
										dateLabel = `${datePart}, ${timePart}`
									} else {
										dateLabel = item.date?.toLocaleDateString('ru-RU', {
											day: '2-digit',
											month: 'short',
										})
									}

									const realValue = minValue + (item.value / 100) * diff
									return (
										<View style={styles.tooltip}>
											<Text style={styles.tooltipDate}>{dateLabel}</Text>
											<Text style={styles.tooltipValue}>
												{formatAmount(realValue, currency)}
											</Text>
										</View>
									)
								},
							}}
						/>
					</ScrollView>
				</View>
			)}

			<View style={styles.segment}>
				{(['1D', '1W', '1M', '6M', '1Y'] as const).map(label => {
					const active = label === range
					return (
						<TouchableOpacity
							key={label}
							style={[styles.segmentItem, active && styles.segmentItemActive]}
							onPress={() => onRangeChange(label)}
							activeOpacity={0.8}
						>
							<Text
								style={[styles.segmentText, active && styles.segmentTextActive]}
							>
								{label}
							</Text>
						</TouchableOpacity>
					)
				})}
			</View>
		</View>
	)
}

function formatLabel(iso: string, range: string) {
	const d = new Date(iso)
	switch (range) {
		case '1D':
			return d.toLocaleTimeString('ru-RU', {
				hour: '2-digit',
				minute: '2-digit',
			})
		case '1W':
		case '1M':
			return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
		case '6M':
		case '1Y':
			return d.toLocaleDateString('ru-RU', { month: 'short' })
		default:
			return ''
	}
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
		backgroundColor: '#1C2B4E',
		borderRadius: 16,
		marginVertical: 10,
	},
	title: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
	date: { color: '#9AA4B1', fontSize: 13, marginBottom: 12 },
	label: { color: '#9AA4B1', fontSize: 14 },
	price: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
	pricePortfolio: { fontSize: 16, fontWeight: '500' },
	errorTitle: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: '600',
		textAlign: 'center',
		marginBottom: 8,
	},
	pricePortfolioLabel: {
		color: '#fff',
		fontSize: 10,
		fontWeight: '500',
		textAlign: 'right',
	},
	containerRow: { flexDirection: 'row', justifyContent: 'space-between' },
	titleFlex: { gap: 10 },
	rowWrapper: {
		marginBottom: 12,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: '#334363',
		paddingVertical: 12,
	},
	row: { flexDirection: 'row', justifyContent: 'space-between' },
	labelText: { color: '#9AA4B1', fontSize: 12 },
	noData: { color: '#9AA4B1', textAlign: 'center', marginVertical: 20 },
	loadingContainer: {
		backgroundColor: 'rgba(250,250,250,0.05)',
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 20,
		marginVertical: 20,
		alignItems: 'center',
	},
	loadingText: {
		color: '#9AA4B1',
		fontSize: 14,
		textAlign: 'center',
	},
	errorContainer: {
		backgroundColor: 'rgba(250,250,250,0.05)',
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 20,
		marginVertical: 20,
		alignItems: 'center',
		gap: 12,
	},
	noDataContainer: {
		backgroundColor: 'rgba(250,250,250,0.05)',
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 20,
		marginVertical: 20,
		alignItems: 'center',
	},
	errorText: {
		color: '#FFFFFF',
		fontSize: 14,
		textAlign: 'center',
		fontWeight: '500',
	},
	noDataText: {
		color: '#9AA4B1',
		fontSize: 14,
		textAlign: 'center',
	},
	retryButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		backgroundColor: '#FAFAFA',
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderWidth: 1,
	},
	retryText: {
		color: '#212121',
		fontSize: 14,
		fontWeight: '500',
	},
	chartWrapper: { marginTop: 12, height: 280 },
	tooltip: {
		backgroundColor: 'rgba(0,0,0,0.85)',
		borderRadius: 10,
		paddingVertical: 6,
		paddingHorizontal: 10,
		alignItems: 'center',
	},
	tooltipValue: { color: '#fff', fontWeight: '700', fontSize: 13 },
	tooltipDate: { color: '#ccc', fontSize: 11, marginBottom: 2 },
	xAxis: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
	yAxis: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
	segment: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.25)',
		borderRadius: 12,
		padding: 6,
		marginTop: 16,
	},
	segmentItem: {
		flex: 1,
		height: 34,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	segmentItemActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
	segmentText: {
		color: 'rgba(255,255,255,0.75)',
		fontSize: 12,
		fontWeight: '600',
		letterSpacing: 0.3,
	},
	segmentTextActive: { color: '#FFFFFF', fontWeight: '800' },
})
