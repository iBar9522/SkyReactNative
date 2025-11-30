import React from 'react'
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { HbOrderResponse } from '@/types/LegacyAdapterTypes'
import { getStatusColor, mapStatusToUi } from './utils'

const MyDealsHistoryItem = ({
	row,
	onPress,
}: {
	row: HbOrderResponse
	onPress?: () => void
}) => {
	const uiStatus = mapStatusToUi(row.status)
	const amountColor = getStatusColor(row.status)
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
						<Text style={[styles.side, { color: amountColor }]}>
							{uiStatus}
						</Text>
					</View>
				</View>

				<View style={styles.rightBox}>
					<Text style={[styles.amount, { color: amountColor }]}>
						{formattedAmount}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	)
}

export default MyDealsHistoryItem

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
