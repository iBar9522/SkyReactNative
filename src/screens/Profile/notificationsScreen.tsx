import { useUpdateUserProfileMutation } from '@/api/profileApi'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useEffect, useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	Switch,
	ScrollView,
	TouchableOpacity,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Toast from 'react-native-toast-message'
import Icon from 'react-native-vector-icons/Ionicons'
import { useAuth } from '@/contexts/AuthContext'

export default function NotificationsScreen() {
	const navigation = useNavigation<NativeStackNavigationProp<any>>()

	const [notificationsEnabled, setNotificationsEnabled] = useState(true)
	const [infoNotifications, setInfoNotifications] = useState(true)
	const [systemNotifications, setSystemNotifications] = useState(false)
	const [investNotifications, setInvestNotifications] = useState(true)

	const { user, refetchUser } = useAuth()
	const [updateUserProfile] = useUpdateUserProfileMutation()

	useEffect(() => {
		if (user?.notificationsEnabled !== undefined) {
			setNotificationsEnabled(user.notificationsEnabled)
		}
	}, [user])

	const handleToggle = async (value: boolean) => {
		setNotificationsEnabled(value)
		try {
			await updateUserProfile({
				notificationsEnabled: value,
			}).unwrap()
			refetchUser()
			Toast.show({
				type: 'success',
				text1: value ? 'Уведомления включены' : 'Уведомления отключены',
			})
		} catch (err) {
			setNotificationsEnabled(prev => !prev)
		}
	}

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#091F44', '#3376F6']}
				style={StyleSheet.absoluteFill}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
			/>
			<View style={styles.overlay} />

			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Icon name='arrow-back' size={24} color='#fff' />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Уведомления</Text>
				<View style={{ width: 24 }} />
			</View>

			<ScrollView contentContainerStyle={styles.scroll}>
				<View style={styles.section}>
					<View style={styles.switchRow}>
						<Text style={styles.switchLabel}>Разрешить уведомления</Text>
						<Switch
							value={notificationsEnabled}
							onValueChange={handleToggle}
							thumbColor='#fff'
							trackColor={{ false: '#555', true: '#3376F6' }}
						/>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Виды уведомлений</Text>

					<View style={styles.switchRow}>
						<Text style={styles.switchLabel}>Новости</Text>
						<Switch
							value={infoNotifications}
							onValueChange={setInfoNotifications}
							thumbColor='#fff'
							trackColor={{ false: '#555', true: '#3376F6' }}
						/>
					</View>

					<View style={styles.switchRow}>
						<Text style={styles.switchLabel}>Операции по счету</Text>
						<Switch
							value={systemNotifications}
							onValueChange={setSystemNotifications}
							thumbColor='#fff'
							trackColor={{ false: '#555', true: '#3376F6' }}
						/>
					</View>

					<View style={styles.switchRow}>
						<Text style={styles.switchLabel}>Инвестиционные идеи</Text>
						<Switch
							value={investNotifications}
							onValueChange={setInvestNotifications}
							thumbColor='#fff'
							trackColor={{ false: '#555', true: '#3376F6' }}
						/>
					</View>
				</View>
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.15)',
	},
	scroll: {
		marginHorizontal: 12,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		position: 'static',
		marginTop: 50,
		top: 0,
		left: 0,
		right: 0,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	headerTitle: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		fontFamily: 'Montserrat',
	},
	section: {
		marginBottom: 32,
		borderRadius: 15,
		backgroundColor: 'rgba(77, 77, 77, 0.1)',
		paddingVertical: 16,
		paddingHorizontal: 16,
	},
	sectionTitle: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '500',
		marginBottom: 12,
		fontFamily: 'Montserrat',
	},
	switchRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 14,
		paddingHorizontal: 8,
		backgroundColor: 'rgba(255, 255, 255, 0.05)',
		borderRadius: 10,
		marginBottom: 12,
	},
	switchLabel: {
		color: '#fff',
		fontSize: 14,
		fontFamily: 'Montserrat',
	},
})
