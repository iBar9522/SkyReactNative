import React, { useCallback, useMemo, useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	SectionList,
	TouchableOpacity,
	RefreshControl,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import NotificationCard from './components/NotificationCard'
import {
	useDeleteAllNotificationsMutation,
	useGetNotificationsHistoryQuery,
} from '@/api/notificationsApi'
import Toast from 'react-native-toast-message'

function formatTime(dateISO: string) {
	const d = new Date(dateISO)
	const day = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
	const time = d.toLocaleTimeString('ru-RU', {
		hour: '2-digit',
		minute: '2-digit',
	})
	return `${day} в ${time}`
}

function normalizeNotifications(apiData: any[] = []) {
	return apiData.map(item => ({
		id: item.id,
		title: item.title || 'Без названия',
		description: item.description || '',
		date: item.createdAt,
		type: item.body?.type,
		isRead: false,
	}))
}

function groupToSections(items: any[]) {
	const now = new Date()
	const startOfToday = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate()
	)
	const startOfYesterday = new Date(startOfToday)
	startOfYesterday.setDate(startOfYesterday.getDate() - 1)
	const startOfWeek = new Date(startOfToday)
	startOfWeek.setDate(startOfWeek.getDate() - 7)

	const today: any[] = []
	const yesterday: any[] = []
	const week: any[] = []
	const earlier: any[] = []

	for (const n of items) {
		const d = new Date(n.date)
		if (d >= startOfToday) today.push(n)
		else if (d >= startOfYesterday) yesterday.push(n)
		else if (d >= startOfWeek) week.push(n)
		else earlier.push(n)
	}

	const toRow = (n: any) => ({
		id: String(n.id),
		title: n.description || n.title,
		time: formatTime(n.date),
		icon: require('@/assets/notification.png'),
		isRead: n.isRead,
	})

	return [
		{ title: 'Сегодня', data: today.map(toRow) },
		{ title: 'Вчера', data: yesterday.map(toRow) },
		{ title: 'На этой неделе', data: week.map(toRow) },
		{ title: 'Ранее', data: earlier.map(toRow) },
	].filter(s => s.data.length > 0)
}

export default function ViewNotificationsScreen() {
	const navigation = useNavigation<NativeStackNavigationProp<any>>()
	const [refreshing, setRefreshing] = useState(false)

	const { data, isFetching, refetch } = useGetNotificationsHistoryQuery({
		page: 1,
		size: 50,
	})
	const [deleteAllNotifications, { isLoading: isDeleting }] =
		useDeleteAllNotificationsMutation()

	const normalized = useMemo(() => normalizeNotifications(data || []), [data])
	const sections = useMemo(() => groupToSections(normalized), [normalized])

	const onRefresh = useCallback(async () => {
		try {
			setRefreshing(true)
			await refetch()
		} finally {
			setRefreshing(false)
		}
	}, [refetch])

	const handleClearAll = async () => {
		try {
			await deleteAllNotifications().unwrap()
			await refetch()
			Toast.show({
				type: 'success',
				text1: 'Уведомления очищены',
				text2: 'Все уведомления успешно удалены',
			})
		} catch (err) {
			console.error('Ошибка при удалении уведомлений:', err)
		}
	}

	return (
		<LinearGradient colors={['#091F44', '#3376F6']} style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Icon name='arrow-back' size={24} color='#fff' />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Уведомления</Text>
				<View style={styles.headerRight}>
					<TouchableOpacity
						style={styles.headerIconBtn}
						onPress={() => navigation.navigate('Notifications')}
					>
						<Icon name='options-outline' size={22} color='#fff' />
					</TouchableOpacity>
				</View>
			</View>

			{isFetching ? (
				<Text style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>
					Загрузка...
				</Text>
			) : (
				<SectionList
					sections={sections}
					keyExtractor={item => item.id}
					contentContainerStyle={styles.listContent}
					stickySectionHeadersEnabled={false}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
							tintColor='#fff'
						/>
					}
					renderItem={() => null}
					renderSectionHeader={({ section }) => {
						const isFirstSection = section === sections[0]
						return (
							<View style={styles.sectionHeaderRow}>
								<Text style={styles.sectionTitle}>{section.title}</Text>
								{isFirstSection && sections.length > 0 && (
									<TouchableOpacity
										onPress={handleClearAll}
										disabled={isDeleting}
										hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
									>
										<Text style={styles.clearAll}>Очистить всё</Text>
									</TouchableOpacity>
								)}
							</View>
						)
					}}
					renderSectionFooter={({ section }) => (
						<View style={styles.sectionGroup}>
							{section.data.map((item: any, idx: number) => (
								<View key={item.id}>
									<NotificationCard
										title={item.title}
										time={item.time}
										icon={item.icon}
										unread={!item.isRead}
									/>
								</View>
							))}
						</View>
					)}
					ListEmptyComponent={
						<Text style={styles.empty}>Уведомлений пока нет</Text>
					}
				/>
			)}
		</LinearGradient>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	header: {
		marginTop: 70,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	headerTitle: {
		color: '#fff',
		fontSize: 20,
		fontWeight: '700',
		fontFamily: 'Montserrat',
	},
	topClearContainer: {
		paddingHorizontal: 16,
		marginBottom: 8,
		alignItems: 'flex-end',
	},
	clearAll: {
		color: 'rgba(133, 146, 163, 1)',
		textDecorationLine: 'underline',
		fontFamily: 'Montserrat',
		fontSize: 13,
	},
	headerRight: { flexDirection: 'row', gap: 12 },
	headerIconBtn: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.10)',
	},
	listContent: { paddingHorizontal: 16, paddingBottom: 40 },

	sectionHeaderRow: {
		marginTop: 14,
		marginBottom: 6,
		paddingHorizontal: 2,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'baseline',
	},
	sectionTitle: {
		color: 'rgba(133, 146, 163, 1)',
		fontFamily: 'Montserrat',
		fontSize: 13,
		fontWeight: '500',
	},
	clearAll: {
		color: 'rgba(133, 146, 163, 1)',
		textDecorationLine: 'underline',
		fontFamily: 'Montserrat',
		fontSize: 13,
	},

	// ✅ общий контейнер для группы уведомлений
	sectionGroup: {
		backgroundColor: 'rgba(255,255,255,0.12)',
		borderRadius: 18,
		paddingHorizontal: 8,
		paddingVertical: 4,
		marginBottom: 16,
	},

	// ✅ делитель между карточками внутри блока
	cardDivider: {
		borderBottomWidth: 1,
		borderRadius: 0,
		marginBottom: 0,
	},

	empty: {
		color: '#fff',
		opacity: 0.7,
		textAlign: 'center',
		marginTop: 40,
	},
})
