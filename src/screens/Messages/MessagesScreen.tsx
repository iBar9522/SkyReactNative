import React, { useMemo } from 'react'
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import MessageCategoryCard from './components/MessageCategoryCard'
import { useGetNotificationsHistoryQuery } from '@/api/notificationsApi'

export default function MessagesScreen() {
	const navigation = useNavigation<NativeStackNavigationProp<any>>()

	const { data, isFetching } = useGetNotificationsHistoryQuery({
		page: 1,
		size: 50,
	})

	const notifications = useMemo(() => {
		if (!Array.isArray(data)) return { unread: 0, last: null }

		const unread = data.filter(n => !n.isRead).length
		const last = data[0] || null

		return { unread, last }
	}, [data])

	return (
		<LinearGradient colors={['#091F44', '#3376F6']} style={styles.container}>
			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => navigation.goBack()}>
						<Icon name='arrow-back' size={24} color='#fff' />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Сообщения</Text>
					<View style={{ width: 24 }} />
				</View>

				<MessageCategoryCard
					title='Поддержка'
					subtitle='Всегда готовы помочь'
					image={require('@/assets/support.png')}
					rightBadge={{ type: 'time', value: '13:15' }}
					onPress={() => navigation.navigate('Support')}
					style={{ marginBottom: 24 }}
				/>

				<MessageCategoryCard
					title='История транзакций'
					subtitle='Вчера'
					image={require('@/assets/transaction_history.png')}
					rightBadge={{ type: 'count', value: 2 }}
					// onPress={() => navigation.navigate('TransactionHistory')}
				/>

				<MessageCategoryCard
					title='Уведомления'
					subtitle={
						isFetching
							? 'Загрузка...'
							: notifications.last?.title || 'Нет новых уведомлений'
					}
					image={require('@/assets/notification.png')}
					rightBadge={{ type: 'count', value: notifications.unread }}
					onPress={() => navigation.navigate('ViewNotifications')}
				/>
			</ScrollView>
		</LinearGradient>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	content: { padding: 16, paddingBottom: 40 },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 18,
		marginTop: 50,
	},
	headerTitle: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		fontFamily: 'Montserrat',
	},
})
