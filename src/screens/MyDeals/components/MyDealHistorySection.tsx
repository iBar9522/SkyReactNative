import React, { useState, useMemo } from 'react'
import { StyleSheet, Text, View, ViewStyle, ScrollView } from 'react-native'
import MyDealsHistoryItem from './MyDealHistoryItem'
import MyDealsDetailsModal from './MyDealsDetail'
import { HbOrderResponse } from '@/types/LegacyAdapterTypes'

const MyDealsHistorySection = ({
	data,
	style,
}: {
	data: HbOrderResponse[] | null
	style?: ViewStyle
}) => {
	const [selected, setSelected] = useState<HbOrderResponse | null>(null)
	const [visible, setVisible] = useState(false)

	const grouped = useMemo(() => {
		const groups: Record<string, HbOrderResponse[]> = {}
		data?.forEach(order => {
			const dateLabel = new Date(order.orderDate).toLocaleDateString('ru-RU', {
				day: '2-digit',
				month: 'long',
			})
			if (!groups[dateLabel]) groups[dateLabel] = []
			groups[dateLabel].push(order)
		})
		return Object.entries(groups).map(([dateLabel, items]) => ({
			dateLabel,
			items,
		}))
	}, [data])

	return (
		<ScrollView style={[styles.wrapper, style]}>
			{grouped.map(group => (
				<View key={group.dateLabel} style={styles.groupCard}>
					<Text style={styles.groupTitle}>{group.dateLabel}</Text>
					<View style={styles.groupBody}>
						{group.items.map((row, idx) => (
							<View
								key={
									row.orderId ?? row.orderNumber ?? `${group.dateLabel}-${idx}`
								}
							>
								<MyDealsHistoryItem
									row={row}
									onPress={() => {
										setSelected(row)
										setVisible(true)
									}}
								/>
								{idx < group.items.length - 1 && (
									<View style={styles.divider} />
								)}
							</View>
						))}
					</View>
				</View>
			))}

			<MyDealsDetailsModal
				visible={visible}
				onClose={() => setVisible(false)}
				row={selected}
			/>
		</ScrollView>
	)
}

export default MyDealsHistorySection

const styles = StyleSheet.create({
	wrapper: { gap: 16 },
	groupCard: {},
	groupTitle: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '700',
		marginVertical: 12,
	},
	groupBody: {
		backgroundColor: 'rgba(250,250,250,0.05)',
		borderRadius: 16,
		padding: 12,
	},
	divider: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: 'rgba(255,255,255,0.08)',
		marginVertical: 8,
	},
})
