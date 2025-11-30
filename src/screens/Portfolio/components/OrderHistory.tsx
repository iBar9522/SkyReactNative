import { OrderHistoryGroup, OrderRow } from '@/types/PortfolioTypes'
import React from 'react'
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native'

const fmtMoney = (v: number) => `${v < 0 ? '-' : ''}$${Math.abs(v).toFixed(2)}`

const OrderHistoryItem = ({ row }: { row: OrderRow }) => {
	return (
		<View style={styles.itemRow}>
			<View style={styles.leftBox}>
				<View style={styles.logoCircle}>
					<Image
						source={row.logo}
						style={styles.logoImg}
						resizeMode='contain'
					/>
				</View>
				<View style={{ marginLeft: 12 }}>
					<Text style={styles.title} numberOfLines={1}>
						{row.title}
					</Text>
					<Text
						style={[
							styles.side,
							row.side === 'buy' ? styles.sideBuy : styles.sideSell,
						]}
					>
						{row.side === 'buy' ? 'Покупка' : 'Продажа'}
					</Text>
				</View>
			</View>

			<View style={styles.rightBox}>
				<Text style={styles.amount}>{fmtMoney(row.amount)}</Text>
				<Text style={styles.account} numberOfLines={1}>
					{row.account}
				</Text>
			</View>
		</View>
	)
}

const OrderHistorySection = ({
	data,
	style,
}: {
	data: OrderHistoryGroup[]
	style?: ViewStyle
}) => {
	return (
		<View style={[styles.wrapper, style]}>
			{data.map(group => (
				<View key={group.dateLabel} style={styles.groupCard}>
					<View style={styles.groupBody}>
						<Text style={styles.groupTitle}>{group.dateLabel}</Text>
						{group.items.map((row, idx) => (
							<View key={row.id}>
								<OrderHistoryItem row={row} />
								{idx < group.items.length - 1 && (
									<View style={styles.divider} />
								)}
							</View>
						))}
					</View>
				</View>
			))}
		</View>
	)
}
export default OrderHistorySection

const styles = StyleSheet.create({
	wrapper: { gap: 12 },
	groupCard: {},
	groupTitle: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '700',
		marginBottom: 12,
	},
	groupBody: {
		backgroundColor: 'rgba(250,250,250,0.05)',
		borderRadius: 16,
		padding: 12,
	},

	itemRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
		justifyContent: 'space-between',
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
		width: 46,
		height: 46,
		borderRadius: 23,
		backgroundColor: '#FFFFFF',
		alignItems: 'center',
		justifyContent: 'center',
	},
	logoImg: { width: 28, height: 28 },

	title: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', maxWidth: 210 },
	side: { marginTop: 4, fontSize: 12 },
	sideBuy: { color: '#9FC2FF' },
	sideSell: { color: '#9FC2FF' },

	amount: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
	account: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 4 },

	divider: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: 'rgba(255,255,255,0.08)',
		marginVertical: 8,
	},
})
