import React, { useEffect, useMemo } from 'react'
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '@/contexts/AuthContext'
import { useGetHbOrdersByUserIdMutation } from '@/api/legacyAdapterApi'
import { getCurrencySymbol } from '@/utils/formats'
import {
	mapStatusToUi,
	getStatusColor,
} from '@/screens/MyDeals/components/utils'

type Props = {
	isin: string
	symbol?: string
	title?: string
	logo?: any
}

export default function StockDealsHistory({
	isin,
	symbol,
	title,
	logo,
}: Props) {
	const navigation = useNavigation<any>()
	const { user } = useAuth()

	const [loadOrders, { data, isLoading }] = useGetHbOrdersByUserIdMutation()

	useEffect(() => {
		if (!user?.oracleUserId) return

		loadOrders({
			userId: user.oracleUserId,
			showPartedOrders: 1,
		})
	}, [user])

	const normalizedOrders = useMemo(() => {
		if (!data || !Array.isArray(data)) return []

		return data
			.filter(order => order?.isin === isin)
			.map(order => ({
				id: order.orderId,
				date: order.orderDate,
				type: order.orderType,
				amount: order.amount || order.orderAmount || order.price || 0,
				currency: order.currency,

				uiStatus: mapStatusToUi(order.status),
				uiStatusColor: getStatusColor(order.status),
			}))
	}, [data, isin])

	const grouped = useMemo(() => {
		if (!normalizedOrders.length) return {}

		return normalizedOrders.reduce((acc: any, order) => {
			const date = new Date(order.date).toLocaleDateString('ru-RU', {
				day: 'numeric',
				month: 'long',
			})
			if (!acc[date]) acc[date] = []
			acc[date].push(order)
			return acc
		}, {})
	}, [normalizedOrders])

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>История заказов</Text>
				<TouchableOpacity
					onPress={() => navigation.navigate('MyDeals')}
					activeOpacity={0.8}
				>
					<Text style={styles.headerLink}>Смотреть все</Text>
				</TouchableOpacity>
			</View>

			{isLoading ? (
				<View style={styles.loader}>
					<ActivityIndicator size='large' color='#fff' />
				</View>
			) : Object.keys(grouped).length === 0 ? (
				<View style={styles.noData}>
					<Text style={styles.noDataText}>Нет истории сделок</Text>
				</View>
			) : (
				<ScrollView>
					{Object.entries(grouped).map(([date, list]) => (
						<View key={date} style={styles.section}>
							<Text style={styles.date}>{date}</Text>

							<View style={styles.card}>
								{(list as any[]).map(item => (
									<View key={item.id} style={styles.itemRow}>
										<View style={styles.leftBox}>
											<View style={styles.logoCircle}>
												<Image
													source={logo}
													style={styles.logoImg}
													resizeMode='contain'
												/>
											</View>

											<View style={{ marginLeft: 12 }}>
												<Text style={styles.title}>{title}</Text>
												<Text style={styles.side}>
													{item.type === 'BUY' ? 'Покупка' : 'Продажа'}
												</Text>
											</View>
										</View>

										<View style={styles.rightBox}>
											<Text
												style={[styles.amount, { color: item.uiStatusColor }]}
											>
												{item.amount
													? `${item.amount.toLocaleString()} ${getCurrencySymbol(
															item.currency
													  )}`
													: '-'}
											</Text>

											{/* <Text
												style={[styles.status, { color: item.uiStatusColor }]}
											>
												{item.uiStatus}
											</Text> */}
										</View>
									</View>
								))}
							</View>
						</View>
					))}
				</ScrollView>
			)}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 24,
	},
	headerTitle: {
		color: '#fff',
		fontSize: 22,
		fontWeight: '700',
	},
	headerLink: {
		color: '#fff',
		fontSize: 13,
		textDecorationLine: 'underline',
		opacity: 0.9,
	},
	loader: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 24,
	},
	noData: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 30,
	},
	noDataText: {
		color: 'rgba(255,255,255,0.7)',
		fontSize: 15,
		fontWeight: '500',
	},
	section: {
		marginBottom: 24,
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderRadius: 16,
		paddingHorizontal: 12,
		paddingTop: 12,
	},
	date: {
		color: '#fff',
		fontWeight: '600',
		fontSize: 16,
		marginBottom: 10,
	},
	status: {
		fontSize: 12,
		marginTop: 4,
	},
	card: {
		paddingVertical: 4,
	},
	itemRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
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
		fontWeight: '600',
		color: '#FFFFFF',
	},
})
