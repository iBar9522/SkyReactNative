import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useState, useMemo } from 'react'
import {
	Image,
	ScrollView,
	StyleSheet,
	Text,
	Dimensions,
	TouchableOpacity,
	View,
	ActivityIndicator,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/Ionicons'
import { LineChart } from 'react-native-chart-kit'
import { G, Rect, Text as SvgText } from 'react-native-svg'

const { width: screenWidth } = Dimensions.get('window')

type RangeKey = '1D' | '1W' | '1M' | '6M' | '1Y'

// Mock data for different ranges
const mockDataByRange: Record<RangeKey, number[]> = {
	'1D': [
		538.7, 539.2, 538.95, 539.45, 540.1, 539.8, 540.25, 541.0, 540.75, 541.3,
		541.05, 540.85,
	],
	'1W': [
		535.2, 536.8, 538.1, 537.65, 539.4, 540.25, 538.9, 540.7, 541.15, 540.95,
		541.3, 540.7,
	],
	'1M': [
		520.5, 525.3, 530.15, 535.8, 538.2, 540.6, 537.9, 539.4, 541.25, 540.85,
		542.1, 540.7,
	],
	'6M': [
		505.2, 515.4, 525.6, 520.3, 530.8, 535.7, 540.2, 538.5, 541.3, 539.85,
		542.15, 540.7,
	],
	'1Y': [
		480.3, 495.2, 510.4, 520.6, 515.3, 525.8, 535.9, 530.4, 540.2, 538.7,
		541.85, 540.7,
	],
}

const mockLabels: Record<RangeKey, string[]> = {
	'1D': [
		'09:00',
		'10:00',
		'11:00',
		'12:00',
		'13:00',
		'14:00',
		'15:00',
		'16:00',
		'17:00',
		'18:00',
		'19:00',
		'20:00',
	],
	'1W': [
		'Пн',
		'Вт',
		'Ср',
		'Чт',
		'Пт',
		'Сб',
		'Вс',
		'Пн',
		'Вт',
		'Ср',
		'Чт',
		'Пт',
	],
	'1M': [
		'18 июля',
		'23 июля',
		'29 июля',
		'01 авг.',
		'07 авг.',
		'12 авг.',
		'17 авг.',
		'22 авг.',
		'27 авг.',
		'01 сен.',
		'06 сен.',
		'11 сен.',
	],
	'6M': [
		'окт',
		'ноя',
		'дек',
		'янв',
		'фев',
		'мар',
		'апр',
		'май',
		'июн',
		'июл',
		'авг',
		'сен',
	],
	'1Y': [
		'2023',
		'фев',
		'мар',
		'апр',
		'май',
		'июн',
		'июл',
		'авг',
		'сен',
		'окт',
		'ноя',
		'дек',
	],
}

const CurrencyDetail = () => {
	const navigation = useNavigation<NativeStackNavigationProp<any>>()
	const [range, setRange] = useState<RangeKey>('1M')
	const [isLoading, setIsLoading] = useState(false)
	const [tooltip, setTooltip] = useState<null | {
		x: number
		y: number
		v: number
		i: number
		date?: string
	}>(null)

	const ranges: RangeKey[] = ['1D', '1W', '1M', '6M', '1Y']

	const currentData = mockDataByRange[range]
	const currentLabels = mockLabels[range]

	const padded = useMemo(() => {
		const min = Math.min(...currentData)
		const max = Math.max(...currentData)
		const span = Math.max(max - min, 0.01)
		const pad = Math.max(span * 0.8, 0.01)
		return [min - pad, ...currentData, max + pad]
	}, [currentData])

	const labelsPadded = useMemo(
		() => ['', ...currentLabels, ''],
		[currentLabels]
	)

	const chartData = useMemo(
		() => ({
			labels: labelsPadded,
			datasets: [
				{
					data: padded,
					color: () => '#00A3FF',
					strokeWidth: 2,
				},
			],
		}),
		[labelsPadded, padded]
	)

	const chartConfig = {
		backgroundGradientFrom: 'transparent',
		backgroundGradientTo: 'transparent',
		color: () => '#00A3FF',
		labelColor: () => '#ccc',
		propsForDots: { r: '2' },
		propsForBackgroundLines: { stroke: '#2a2f4a' },
		formatYLabel: (v: string) => Number(v).toFixed(2),
	}

	const formatTooltipDate = (index: number, range: RangeKey) => {
		const realIdx = index - 1
		if (realIdx < 0 || realIdx >= currentLabels.length) return ''
		return currentLabels[realIdx]
	}
	const chartKey = useMemo(
		() =>
			`chart-${range}-${isLoading ? 'loading' : 'loaded'}-${
				currentData.length
			}`,
		[range, isLoading, currentData.length]
	)

	const handleRangeChange = (newRange: RangeKey) => {
		if (newRange === range) return

		setIsLoading(true)
		setTooltip(null)

		setTimeout(() => {
			setRange(newRange)
			setIsLoading(false)
		}, 100)
	}

	const EMPTY_CHART = useMemo(
		() => ({
			labels: new Array(7).fill(''),
			datasets: [
				{
					data: [0],
					color: () => 'transparent',
					strokeWidth: 0,
				},
			],
		}),
		[]
	)

	const dataForChart = isLoading ? EMPTY_CHART : chartData

	return (
		<SafeAreaView style={{ flex: 1, margin: -18 }}>
			<LinearGradient
				colors={['#091F44', '#3376F6']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				style={StyleSheet.absoluteFill}
			/>
			<ScrollView contentContainerStyle={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => navigation.goBack()}>
						<Icon name='arrow-back' size={24} color='#fff' />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>USD ↔ KZT</Text>
					<View style={{ width: 24 }} />
				</View>

				{/* Currency Info Card */}
				<View style={styles.currencyCard}>
					<Text style={styles.sourceText}>Источник: FX</Text>

					<View style={styles.currencyRow}>
						<View style={styles.currencyLeft}>
							<Text style={styles.currencyPair}>USD ⇄ KZT</Text>
							<View style={styles.changeContainer}>
								<Icon name='trending-up' size={14} color='#00ff8a' />
								<Text style={styles.changeText}>$245.76 (1.34%)</Text>
							</View>
						</View>
						<View style={styles.currencyRight}>
							<Text style={styles.currentRate}>
								{currentData[currentData.length - 1].toFixed(2)} KZT
							</Text>
						</View>
					</View>

					<View style={styles.previousWeekContainer}>
						<Text style={styles.previousWeekText}>
							Δ прошлая неделя (20-27 марта)
						</Text>
						<Image source={require('@/assets/dropdown.png')} />
					</View>
				</View>

				{/* Enhanced Chart */}
				<View style={styles.chartWrapper}>
					<LineChart
						key={`chart-${range}-${
							isLoading ? 'loading' : 'loaded'
						}-${Date.now()}`}
						data={dataForChart}
						width={screenWidth - 32}
						height={220}
						chartConfig={chartConfig}
						withHorizontalLabels={true}
						withVerticalLabels={false}
						withInnerLines={!isLoading}
						fromZero={isLoading}
						bezier={!isLoading}
						segments={4}
						yLabelsOffset={12}
						xLabelsOffset={-4}
						propsForDots={{ r: isLoading ? '0' : '3' }}
						onDataPointClick={({ x, y, value, index }) => {
							if (isLoading) return

							const isGhost =
								index === 0 ||
								index === (dataForChart.datasets[0].data as number[]).length - 1
							if (isGhost) return

							const dateLabel = formatTooltipDate(index, range)

							if (tooltip?.i === index) setTooltip(null)
							else
								setTooltip({
									x,
									y,
									v: Number(value),
									i: index,
									date: dateLabel,
								})
						}}
						decorator={() => {
							if (isLoading || !tooltip) return null

							const dataArr = (dataForChart.datasets?.[0]?.data ??
								[]) as number[]
							if (tooltip.i === 0 || tooltip.i === dataArr.length - 1)
								return null

							const PADDING = 6
							const boxW = 110
							const boxH = 40

							const tx = Math.max(
								PADDING,
								Math.min(
									tooltip.x - boxW / 2,
									screenWidth - 32 - boxW - PADDING
								)
							)
							const ty = Math.max(PADDING, tooltip.y - boxH - 10)

							return (
								<G>
									<Rect
										x={tx}
										y={ty}
										rx={6}
										ry={6}
										width={boxW}
										height={boxH}
										fill='rgba(0,0,0,0.8)'
										stroke='#00A3FF'
										strokeWidth={1}
									/>

									<SvgText
										x={tx + boxW / 2}
										y={ty + 16}
										fill='#fff'
										fontSize='12'
										textAnchor='middle'
									>
										{Number(tooltip.v).toFixed(2)} KZT
									</SvgText>

									{!!tooltip.date && (
										<SvgText
											x={tx + boxW / 2}
											y={ty + 30}
											fill='#B8C1CC'
											fontSize='11'
											textAnchor='middle'
										>
											{tooltip.date}
										</SvgText>
									)}
								</G>
							)
						}}
						style={{ borderRadius: 12 }}
					/>

					{isLoading && (
						<View style={styles.chartLoader}>
							<ActivityIndicator color='#00A3FF' />
						</View>
					)}
				</View>

				<View style={styles.rangeTabs}>
					{ranges.map(label => (
						<TouchableOpacity
							key={label}
							style={[
								styles.rangeTab,
								label === range && { backgroundColor: '#2a3d66' },
							]}
							onPress={() => handleRangeChange(label)}
						>
							<Text style={styles.rangeTabText}>{label}</Text>
						</TouchableOpacity>
					))}
				</View>

				<View style={styles.balanceWrapper}>
					<Text style={styles.balanceLabel}>Сумма на счёте</Text>
					<View style={styles.balanceBlur}>
						<Text style={styles.balanceAmount}>1500 USD</Text>
					</View>
				</View>

				<View style={styles.buttonsRow}>
					<TouchableOpacity style={styles.buyButton}>
						<Text style={styles.buyText}>Купить</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.sellButton}>
						<Image source={require('@/assets/export.png')} />
						<Text style={styles.sellText}>Продать</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 16,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 24,
	},
	headerTitle: {
		color: '#fff',
		fontSize: 16,
		fontFamily: 'Montserrat',
		fontWeight: '600',
	},
	currencyCard: {
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderRadius: 16,
		padding: 20,
		marginBottom: 24,
	},
	sourceText: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.7)',
		marginBottom: 12,
	},
	currencyRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 16,
	},
	currencyLeft: {
		flex: 1,
	},
	currencyPair: {
		fontSize: 20,
		fontWeight: '600',
		color: '#fff',
		marginBottom: 8,
	},
	changeContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	changeText: {
		color: '#00ff8a',
		fontSize: 14,
		fontWeight: '500',
	},
	currencyRight: {
		alignItems: 'flex-end',
	},
	currentRate: {
		fontSize: 24,
		fontWeight: '600',
		color: '#fff',
	},
	previousWeekContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	previousWeekText: {
		color: '#FAFAFA',
		fontSize: 14,
	},
	chartWrapper: {
		alignItems: 'center',
		marginBottom: 16,
		position: 'relative',
	},
	chartLoader: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	rangeTabs: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
	},
	rangeTab: {
		paddingVertical: 6,
		paddingHorizontal: 10,
		backgroundColor: '#1c2d4d',
		borderRadius: 6,
	},
	rangeTabText: {
		color: '#fff',
		fontSize: 12,
	},
	balanceWrapper: {
		marginTop: 20,
	},
	balanceLabel: {
		color: '#ccc',
		fontFamily: 'Montserrat',
		fontSize: 13,
		textAlign: 'center',
		marginBottom: 7,
	},
	balanceBlur: {
		paddingHorizontal: 24,
		paddingVertical: 8,
		backgroundColor: 'rgba(255,255,255,0.1)',
		borderRadius: 12,
		borderWidth: 1,
		justifyContent: 'center',
		flex: 1,
		alignItems: 'center',
		borderColor: 'rgba(255,255,255,0.3)',
	},
	balanceAmount: {
		color: '#fff',
		fontSize: 20,
		fontWeight: 'bold',
		marginTop: 4,
		fontFamily: 'Montserrat',
	},
	buttonsRow: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 20,
	},
	buyButton: {
		flex: 1,
		backgroundColor: '#fff',
		height: 48,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
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
	buyText: {
		color: '#000',
		fontWeight: '600',
		fontFamily: 'Montserrat',
	},
	sellText: {
		color: '#fff',
		fontWeight: '600',
		fontFamily: 'Montserrat',
	},
})

export default CurrencyDetail
