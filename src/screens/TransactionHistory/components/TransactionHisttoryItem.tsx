import React from 'react'
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { HbOrderResponse } from '@/types/LegacyAdapterTypes'

const TransactionHistoryItem = ({
	row,
	onPress,
}: {
	row: HbOrderResponse
	onPress?: () => void
}) => {
	const getAmountColor = (status?: string) => {
		if (!status) return '#FFFFFF'
		const s = status.toLowerCase()

		if (s.includes('не исполнен') || s.includes('отклонено')) return '#FF5C5C' // красный
		if (s.includes('на расчетах')) return '#06D6A0' // зеленый
		if (
			s.includes('исполнен') ||
			s.includes('подтвержден') ||
			s.includes('заявка исполнена')
		)
			return '#FAFAFA' // серый

		return '#FFFFFF'
	}

	const formattedAmount = `${row.amount ?? ''} ${row.currency ?? ''}`

	return (
		<TouchableOpacity onPress={onPress} activeOpacity={0.7}>
			<View style={styles.itemRow}>
				<View style={styles.leftBox}>
					<View style={styles.logoCircle}>
						<Image
							source={require('@/assets/amazon.png')}
							style={styles.logoImg}
							resizeMode='contain'
						/>
					</View>

					<View style={{ marginLeft: 12 }}>
						<Text style={styles.title} numberOfLines={1}>
							{row.ticker?.length > 15
								? row.ticker.slice(0, 15) + '...'
								: row.ticker}
						</Text>
						<Text style={styles.side}>{row.status}</Text>
					</View>
				</View>

				<View style={styles.rightBox}>
					<Text style={[styles.amount, { color: getAmountColor(row.status) }]}>
						{formattedAmount}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	)
}

export default TransactionHistoryItem

const styles = StyleSheet.create({
	itemRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		justifyContent: 'space-between',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: 'rgba(255,255,255,0.1)',
	},
	leftBox: {
		flexDirection: 'row',
		alignItems: 'center',
		flexShrink: 1,
	},
	rightBox: {
		alignItems: 'flex-end',
		flexShrink: 1,
		marginLeft: 10,
	},
	logoCircle: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: '#FFF',
		alignItems: 'center',
		justifyContent: 'center',
	},
	logoImg: { width: 26, height: 26 },
	title: {
		color: '#FFFFFF',
		fontSize: 15,
		fontWeight: '600',
		maxWidth: 210,
	},
	side: {
		marginTop: 4,
		fontSize: 12,
		color: 'rgba(255,255,255,0.6)',
	},
	amount: {
		fontSize: 16,
		fontWeight: '700',
	},
})
