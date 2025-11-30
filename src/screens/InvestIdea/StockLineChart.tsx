import React, { useMemo, useState } from 'react'
import {
	View,
	StyleSheet,
	Dimensions,
	Text,
	ScrollView,
	TouchableOpacity,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { LineChart } from 'react-native-gifted-charts'
import { buildParamsForRange } from '../Trade/components/StockDetail'
import { RangeKey } from '@/types/PortfolioTypes'
import {
	useGetStockIntervalsQuery,
	useGetStockHistoryByIsinQuery,
	useGetSnapshotsTodayQuery,
} from '@/api/marketsApi'
import { IntervalCandle } from '@/types/MarketsTypes'

type ChartRange = Exclude<RangeKey, 'ALL'>

type LinePoint = {
	value: number
	label: string
	date: Date
}

type Props = { data: any }

const screenWidth = Dimensions.get('window').width
const CURRENCY: 'USD' | 'KZT' = 'USD'
const CUR = {
	USD: { prefix: '$', suffix: '' },
	KZT: { prefix: '', suffix: ' KZT' },
} as const

const formatDateTime = (date: string, time: string) => {
	if (!date || !time) return null
	const year = date.slice(0, 4)
	const month = date.slice(4, 6)
	const day = date.slice(6, 8)
	return `${year}-${month}-${day}T${time}`
}

const StockLineChart: React.FC<Props> = ({ data }) => {
	const [range, setRange] = useState<ChartRange>('1M')
	const isAixMarket = data?.market?.toUpperCase() === 'AIX'

	console.log(data)
	const params = useMemo(() => {
		const p = buildParamsForRange(range as any)
		return {
			symbol: data.ticker,
			intervalSize: p.intervalSize,
			startDate: p.startDate,
			endDate: p.endDate,
			pageSize: p.pageSize,
			market: data?.market || 'NASDAQ',
		}
	}, [range, data.ticker])

	// --- Snapshots только для AIX и диапазона 1D
	const {
		data: snapshotsData,
		isLoading: isSnapshotsLoading,
		isFetching: isSnapshotsFetching,
	} = useGetSnapshotsTodayQuery(
		{ stockId: data?.marketData?.id, page: 1, pageSize: 500 },
		{
			skip: !(isAixMarket && range === '1D' && data?.marketData?.id),
			refetchOnMountOrArgChange: true,
			refetchOnFocus: true,
			refetchOnReconnect: true,
		}
	)

	// --- Intervals только для Global (1D)
	const {
		data: intervalsData,
		isLoading: isIntervalsLoading,
		isFetching: isIntervalsFetching,
	} = useGetStockIntervalsQuery(params, {
		skip: !(range === '1D' && !isAixMarket && data?.ticker),
		refetchOnMountOrArgChange: true,
		refetchOnFocus: true,
		refetchOnReconnect: true,
	})

	// --- История по ISIN для диапазонов > 1D (и для AIX, и для Global)
	const {
		data: historyByIsinData,
		isLoading: isIsinLoading,
		isFetching: isIsinFetching,
	} = useGetStockHistoryByIsinQuery(
		{
			isin: data?.marketData?.isin,
			startDate: params.startDate,
			endDate: params.endDate,
			pageSize: params.pageSize,
		},
		{
			skip: !(range !== '1D' && data?.marketData?.isin),
			refetchOnMountOrArgChange: true,
			refetchOnFocus: true,
			refetchOnReconnect: true,
		}
	)

	const rawData: any[] = useMemo(() => {
		if (range === '1D') {
			if (isAixMarket && Array.isArray(snapshotsData?.snapshots)) {
				return snapshotsData.snapshots.map((s: any) => ({
					close: Number(s?.price ?? 0),
					time: formatDateTime(s?.date, s?.time),
				}))
			}

			return Array.isArray(intervalsData) ? intervalsData : []
		}

		if ((historyByIsinData as any)?.data?.history?.length) {
			return ((historyByIsinData as any).data.history ?? [])
				.slice()
				.reverse()
				.map((h: any) => ({
					close: Number(h?.closePrice ?? 0),
					time: h?.date,
				}))
		}

		return []
	}, [range, isAixMarket, intervalsData, snapshotsData, historyByIsinData])

	const isLoading =
		range === '1D'
			? isAixMarket
				? isSnapshotsLoading || isSnapshotsFetching
				: isIntervalsLoading || isIntervalsFetching
			: isIsinLoading || isIsinFetching

	// упрощаем данные до свечей (один источник)
	const candlesOrdered = useMemo(() => {
		const arr = Array.isArray(rawData) ? rawData : []
		return arr.map((c: any) => ({
			close: Number(
				(c as IntervalCandle)?.close ?? (c as any)?.closePrice ?? 0
			),
			time:
				(c as any)?.close_time ||
				(c as any)?.time ||
				(c as any)?.closeTime ||
				(c as any)?.timestamp ||
				(typeof (c as any)?.date === 'string' ? (c as any)?.date : undefined),
		})) as Array<Pick<IntervalCandle, 'close'> & { time?: string }>
	}, [rawData])

	const visiblePointsByRange: Record<string, number> = {
		'1D': 80,
		'1W': 7,
		'1M': 10,
		'6M': 10,
		'1Y': 10,
	}

	const visibleData = useMemo(() => {
		const arr = candlesOrdered || []
		const total = arr.length
		if (!total) return [] as typeof arr
		const target = visiblePointsByRange[range] ?? 6
		const step = Math.max(1, Math.floor(total / target))
		return arr.filter((_, i) => i % step === 0)
	}, [candlesOrdered, range])

	const chartData: LinePoint[] = useMemo(() => {
		return (visibleData || []).map((c: any) => {
			const iso = c?.time
			const d = iso ? new Date(iso) : new Date()
			return {
				value: Number(c?.close ?? 0),
				label: formatLabel(iso, range),
				date: d,
			}
		})
	}, [visibleData, range])

	const hasChartData = chartData.length > 0

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
		? Array.from({ length: noOfSections + 1 }, (_, i) =>
				(yMin + sectionStep * i).toFixed(2)
		  )
		: []

	const chartWidth = normalizedData.length * (range === '1W' ? 80 : 55)

	const ranges: ChartRange[] = ['1D', '1W', '1M', '6M', '1Y']
	const fmtPrice = (n: number) =>
		`${CUR[CURRENCY].prefix}${n.toFixed(2)}${CUR[CURRENCY].suffix}`
	const [pointerEnabled, setPointerEnabled] = useState(false)
	const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null)

	return (
		<View
			style={[styles.chartWrapper, { borderRadius: 16, overflow: 'hidden' }]}
		>
			<LinearGradient
				colors={['transparent', 'rgba(0,0,0,0.35)']}
				style={StyleSheet.absoluteFill}
				pointerEvents='none'
			/>
			<View style={styles.chartInner}>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{
						alignItems: 'flex-start',
						paddingLeft: 16,
						paddingRight: 16,
					}}
					onScrollBeginDrag={() => setPointerEnabled(false)}
					onTouchStart={() => {
						const timer = setTimeout(() => setPointerEnabled(true), 500)
						setPressTimer(timer)
					}}
					onTouchEnd={() => {
						if (pressTimer) clearTimeout(pressTimer)
						setPointerEnabled(false)
					}}
					scrollEnabled={!pointerEnabled}
				>
					<LineChart
						curved
						areaChart
						data={normalizedData as any}
						height={240}
						width={chartWidth}
						thickness={2}
						color='#00A3FF'
						startFillColor='#00A3FF'
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
						yAxisLabelWidth={70}
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
							showPointerStrip: pointerEnabled,
							activatePointersOnLongPress: true,
							onPointerEnter: () => setPointerEnabled(true),
							onPointerLeave: () => setPointerEnabled(false),
							pointerStripColor: 'rgba(255,255,255,0.3)',
							pointerStripWidth: 1,
							pointerColor: '#00A3FF',
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
											{fmtPrice(realValue)}
										</Text>
									</View>
								)
							},
						}}
					/>
				</ScrollView>
			</View>

			<View style={styles.segment}>
				{ranges.map(label => {
					const active = label === range
					return (
						<TouchableOpacity
							key={label}
							style={[styles.segmentItem, active && styles.segmentItemActive]}
							onPress={() => setRange(label)}
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

export default StockLineChart

function formatLabel(iso?: string, range?: string) {
	if (!iso) return ''
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
	chartWrapper: { alignItems: 'center', margin: 16, padding: 16 },
	chartInner: { marginTop: 0, height: 280, width: '100%' },
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
		marginHorizontal: 16,
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
	xAxis: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
	yAxis: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
	tooltip: {
		backgroundColor: 'rgba(0,0,0,0.85)',
		borderRadius: 10,
		paddingVertical: 6,
		paddingHorizontal: 10,
		alignItems: 'center',
	},
	tooltipValue: {
		color: '#FFF',
		fontSize: 14,
		fontWeight: '700',
		textAlign: 'center',
	},
	tooltipDate: { color: '#ccc', fontSize: 11, marginBottom: 2 },
})
