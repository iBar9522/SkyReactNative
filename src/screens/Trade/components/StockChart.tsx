import React, { useMemo, useState } from 'react'
import { View, StyleSheet, Text, Dimensions, ScrollView } from 'react-native'
import { LineChart } from 'react-native-gifted-charts'

type Candle = { close: number; time: string }
type RangeKey = '1D' | '1W' | '1M' | '6M' | '1Y'

interface Props {
	candles: Candle[]
	range?: RangeKey
}

export default function StockChart({ candles, range = '1M' }: Props) {
	const [pointerEnabled, setPointerEnabled] = useState(false)
	const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null)

	const visiblePointsByRange: Record<RangeKey, number> = {
		'1D': 80,
		'1W': 7,
		'1M': 10,
		'6M': 10,
		'1Y': 10,
	}

	const visibleData = useMemo(() => {
		if (!candles?.length) return []
		const total = candles.length
		const target = visiblePointsByRange[range] ?? 6
		const step = Math.max(1, Math.floor(total / target))
		return candles.filter((_, i) => i % step === 0)
	}, [candles, range])

	const chartData = useMemo(() => {
		return visibleData.map(c => ({
			value: Number(c.close),
			label: formatLabel(c.time, range),
			date: new Date(c.time),
		}))
	}, [visibleData, range])

	if (!chartData.length) return null

	const values = chartData.map(p => p.value)
	const rawMin = Math.min(...values)
	const rawMax = Math.max(...values)
	const rawDiff = rawMax - rawMin || 1

	const paddingFactor = range === '1D' ? 0.1 : 0.08
	const minValue = rawMin - rawDiff * paddingFactor
	const maxValue = rawMax + rawDiff * paddingFactor
	const diff = maxValue - minValue

	const normalizedData = chartData.map(p => ({
		...p,
		value: ((p.value - minValue) / diff) * 100,
	}))

	const yMin = minValue - diff * 0.05
	const yMax = maxValue + diff * 0.05

	const noOfSections = 4
	const sectionStep = (yMax - yMin) / noOfSections
	const customYAxisLabels = Array.from({ length: noOfSections + 1 }, (_, i) =>
		(yMin + sectionStep * i).toFixed(2)
	)

	const chartWidth = normalizedData.length * (range === '1W' ? 80 : 55)

	return (
		<View style={styles.container}>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				onScrollBeginDrag={() => setPointerEnabled(false)}
				contentContainerStyle={{
					alignItems: 'flex-start',
					paddingLeft: 16,
					paddingRight: 16,
				}}
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
					data={normalizedData}
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
										${realValue.toFixed(2)}
									</Text>
								</View>
							)
						},
					}}
				/>
			</ScrollView>
		</View>
	)
}

function formatLabel(iso: string, range: RangeKey) {
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
	container: { marginTop: 12, height: 280 },
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
})
