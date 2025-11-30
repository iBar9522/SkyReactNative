import React, { useMemo } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { PieChart } from 'react-native-gifted-charts'

export type PortfolioPieItem = {
	label: string
	value: number
	share?: number // percentage of total portfolio
	color?: string
}

interface PortfolioPieChartProps {
	data: PortfolioPieItem[]
}

const COLORS = [
	'#7B9AFF',
	'#6BCB77',
	'#FFB347',
	'#4CC9F0',
	'#B388EB',
	'#3A86FF',
	'#FFD6A5',
	'#CDB4DB',
]

const PortfolioPieChart: React.FC<PortfolioPieChartProps> = ({ data }) => {
	const total = data.reduce((sum, item) => sum + item.value, 0) || 1

	const chartData = useMemo(() => {
		return data.map((item, i) => {

			return {
				value: item.value,
				color: item.color || COLORS[i % COLORS.length],
				text: `${item.share?.toFixed(1)}%`,
				label: item.label,
	
			}
		})
	}, [data, total])

	return (
		<View style={styles.wrapper}>
			<PieChart
				data={chartData}
				donut
				radius={120}
				innerRadius={50}
				innerCircleColor='#112f63'
				focusOnPress={false}
				showText
				textColor='#fff'
				textSize={12}
				showTextBackground={false}
			/>

			<View style={styles.labels}>
				{chartData.map((item, index) => (
					<View key={index} style={styles.labelRow}>
						<View style={[styles.colorBox, { backgroundColor: item.color }]} />
				
						<Text style={styles.percentageText}>{item.label}</Text>
					</View>
				))}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 20,
	},
	labels: {
		marginTop: 20,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
	},
	labelRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginHorizontal: 10,
		marginBottom: 8,
	},
	colorBox: {
		width: 14,
		height: 14,
		borderRadius: 3,
		marginRight: 6,
	},
	labelText: {
		color: '#fff',
		fontSize: 14,
		flex: 1,
	},
	percentageText: {
		color: '#9AA4B1',
		fontSize: 12,
		marginLeft: 8,
	},
})

export default PortfolioPieChart
