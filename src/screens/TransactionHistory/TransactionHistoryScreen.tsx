import { useGetHbOrdersByUserIdMutation } from '@/api/legacyAdapterApi'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useState, useMemo } from 'react'
import {
	ActivityIndicator,
	SafeAreaView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'
import MyDealsHistorySection from './components/TransactionHistorySection'
import MyDealsDetailsModal from './components/TransactionDetail'
import { HbOrderResponse } from '@/types/LegacyAdapterTypes'
import MyDealsFilterModal from './components/TransactionFilter'

const TransactionHistoryScreen = () => {
	const [search, setSearch] = useState('')
	const navigation = useNavigation()
	const { user } = useAuth()

	const [selectedOrder, setSelectedOrder] = useState<HbOrderResponse | null>(
		null
	)
	const [modalVisible, setModalVisible] = useState(false)
	const [filterVisible, setFilterVisible] = useState(false)
	const [filters, setFilters] = useState<{
		status?: number
		dateRange?: string
	}>({})

	const [getOrders, { data: orders, isLoading }] =
		useGetHbOrdersByUserIdMutation()

	useEffect(() => {
		if (!user?.oracleClientId) return

		const body: any = {
			userId: user?.oracleClientId,
		}

		if (filters.status) {
			body.statusId = filters.status
		}

		if (filters.dateRange) {
			const now = new Date()
			let begDate: Date | null = null

			if (filters.dateRange === '3d') {
				begDate = new Date(now.setDate(now.getDate() - 3))
			} else if (filters.dateRange === '7d') {
				begDate = new Date(now.setDate(now.getDate() - 7))
			} else if (filters.dateRange === '1m') {
				begDate = new Date(now.setMonth(now.getMonth() - 1))
			}

			if (begDate) {
				body.begDate = begDate.toISOString().split('T')[0]
				body.endDate = new Date().toISOString().split('T')[0]
			}
		}

		getOrders(body)
	}, [user?.oracleClientId, filters])

	const filteredOrders = useMemo(() => {
		if (!orders) return []
		return orders
			.filter(
				order =>
					order.instrumentCode?.toLowerCase().includes(search.toLowerCase()) ||
					order.orderNumber?.toLowerCase().includes(search.toLowerCase())
			)
			.sort((a, b) => {
				const dateA = new Date(a.orderDate).getTime()
				const dateB = new Date(b.orderDate || b.createdAt || 0).getTime()
				return dateB - dateA
			})
	}, [orders, search])

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient
				colors={['#091F44', '#3376F6']}
				style={StyleSheet.absoluteFill}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
			/>

			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Icon name='arrow-back' size={24} color='#fff' />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>История транзакций</Text>
				<View style={{ width: 24 }} />
			</View>

			<View style={styles.content}>
				<View style={styles.searchBox}>
					<Icon name='search-outline' size={18} color='rgba(255,255,255,0.6)' />
					<TextInput
						style={styles.searchInput}
						placeholder='Поиск'
						placeholderTextColor='rgba(255,255,255,0.6)'
						value={search}
						onChangeText={setSearch}
					/>
					<TouchableOpacity onPress={() => setFilterVisible(true)}>
						<Icon
							name='filter-outline'
							size={18}
							color='rgba(255,255,255,0.6)'
						/>
					</TouchableOpacity>
				</View>

				{isLoading ? (
					<View style={styles.loader}>
						<ActivityIndicator size='large' color='#fff' />
					</View>
				) : (
					<MyDealsHistorySection data={filteredOrders} style={{ flex: 1 }} />
				)}
			</View>

			<MyDealsDetailsModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				row={selectedOrder}
			/>

			<MyDealsFilterModal
				visible={filterVisible}
				onClose={() => setFilterVisible(false)}
				onApply={setFilters}
				currentFilters={filters}
			/>
		</SafeAreaView>
	)
}

export default TransactionHistoryScreen

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#0C2D63',
		paddingHorizontal: 16,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 16,
		paddingHorizontal: 16,
	},
	headerTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '700',
	},
	content: {
		padding: 16,
		flex: 1,
	},
	searchBox: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(250,250,250,0.08)',
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 8,
		marginBottom: 16,
	},
	searchInput: {
		flex: 1,
		color: '#fff',
		marginHorizontal: 8,
		fontSize: 14,
	},
	loader: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
})
