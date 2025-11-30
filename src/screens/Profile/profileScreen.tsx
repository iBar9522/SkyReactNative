import { useAuth } from '@/contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useState } from 'react'
import {
	ActivityIndicator,
	Modal,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import ConfirmModal from './components/ConfirmModal'
import Icon from 'react-native-vector-icons/Ionicons'

export default function ProfileScreen() {
	const navigation = useNavigation<NativeStackNavigationProp<any>>()
	const { logout, user } = useAuth()
	const [confirmVisible, setConfirmVisible] = useState(false)
	const API_HOST_IMAGE = 'http://82.200.247.197:9000'

	const handleLogout = async () => {
		try {
			await logout()
			navigation.reset({
				index: 0,
				routes: [{ name: 'Welcome' }],
			})
		} catch (error) {
			console.warn('Logout error:', error)
		}
	}

	const getInitials = (firstName?: string, lastName?: string) => {
		const first = firstName?.[0]?.toUpperCase() ?? ''
		const last = lastName?.[0]?.toUpperCase() ?? ''
		return `${first}${last}`
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
				<TouchableOpacity
					onPress={() =>
						navigation.reset({
							index: 0,
							routes: [{ name: 'Tabs' }],
						})
					}
				>
					<Icon name='arrow-back' size={24} color='#fff' />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Профиль</Text>
				<View style={{ width: 24 }} />
			</View>
			<ScrollView contentContainerStyle={styles.scroll}>
				<View style={styles.avatarWrapper}>
					{user?.profileImageUrl ? (
						<Image
							source={{ uri: `${API_HOST_IMAGE}${user.profileImageUrl}` }}
							style={styles.avatar}
						/>
					) : (
						<View style={styles.initialsAvatar}>
							<Text style={styles.initialsText}>
								{getInitials(user?.firstName, user?.lastName)}
							</Text>
						</View>
					)}
				</View>

				{!user ? (
					<ActivityIndicator color='#fff' />
				) : (
					<>
						<Text style={styles.name}>
							{user?.firstName} {user?.lastName}
						</Text>
						<Text style={styles.phone}>{user?.phone}</Text>
					</>
				)}

				<View>
					{!user?.isQualified ? (
						<Text style={styles.qualifiedInvestorText}>
							Неквалифицированный инвестор
						</Text>
					) : (
						<Text style={styles.qualifiedInvestorText}>
							Вы квалифицированный инвестор
						</Text>
					)}
				</View>

				<View style={styles.profileBackground}>
					{/* <TouchableOpacity style={styles.primaryButton}>
						<Text style={styles.primaryButtonText}>Поднять Статус</Text>
					</TouchableOpacity> */}

					<View style={styles.menu}>
						{['Личные данные', 'Настройки', 'Политика'].map((label, index) => {
							const handlePress = () => {
								if (label === 'Личные данные') {
									navigation.navigate('EditPersonalInfo')
								}
								if (label === 'Настройки') {
									navigation.navigate('Settings')
								}
								if (label === 'Политика') {
									navigation.navigate('Policy')
								}
							}
							return (
								<TouchableOpacity
									key={index}
									style={styles.menuItem}
									onPress={handlePress}
								>
									<Text style={styles.menuText}>{label}</Text>
									<Icon name='chevron-forward' size={20} color='#fff' />
								</TouchableOpacity>
							)
						})}

						{/* <TouchableOpacity
							style={styles.menuItem}
							onPress={() => navigation.navigate('Withdraw')}
						>
							<Text style={styles.menuText}>Вывод средств</Text>
						</TouchableOpacity> */}
						{!user?.isQualified && (
							<View>
								<TouchableOpacity
									style={styles.confirmQualification}
									onPress={() => navigation.navigate('QualificationCriteria')}
								>
									<Text style={styles.confirmQualificationText}>
										Подтвердить квалификацию{' '}
									</Text>
								</TouchableOpacity>
								<Text style={styles.takeQualificationText}>
									для получения статуса квалифицированного инвестора
								</Text>
							</View>
						)}
					</View>
				</View>
			</ScrollView>

			<TouchableOpacity
				style={[styles.menuItemBottom]}
				onPress={() => setConfirmVisible(true)}
			>
				<Text style={styles.menuText}>Выход</Text>
				<Image
					source={require('@/assets/logout.png')}
					style={{ width: 24, height: 24, tintColor: '#fff' }}
					resizeMode='contain'
				/>
			</TouchableOpacity>

			<ConfirmModal
				visible={confirmVisible}
				title='Вы хотите выйти?'
				subtitle='Вы уверены, что хотите выйти?'
				onCancel={() => setConfirmVisible(false)}
				onConfirm={async () => {
					setConfirmVisible(false)
					await handleLogout()
				}}
			/>
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
		padding: 12,
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
		fontFamily: 'Montserrat',
		fontSize: 16,
		fontWeight: '600',
	},
	avatarWrapper: {
		alignSelf: 'center',
		position: 'relative',
		marginBottom: 12,
	},
	avatar: {
		width: 96,
		height: 96,
		borderRadius: 48,
	},
	initialsAvatar: {
		width: 96,
		height: 96,
		borderRadius: 48,
		backgroundColor: '#1C3F77',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.15)',
	},
	initialsText: {
		color: '#fff',
		fontSize: 32,
		fontWeight: '700',
		fontFamily: 'Montserrat',
	},
	editIcon: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		backgroundColor: '#fff',
		width: 24,
		height: 24,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
	},
	name: {
		textAlign: 'center',
		color: '#fff',
		fontSize: 18,
		fontFamily: 'Montserrat',
		fontWeight: '600',
		marginBottom: 4,
	},
	phone: {
		textAlign: 'center',
		color: '#ccc',
		fontSize: 14,
		fontFamily: 'Montserrat',
		marginBottom: 24,
	},
	profileBackground: {
		borderRadius: 15,
		backgroundColor: 'rgba(77, 77, 77, 0.1)',
		padding: 12,
	},
	primaryButton: {
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingVertical: 14,
		alignItems: 'center',
		marginBottom: 24,
	},
	primaryButtonText: {
		color: '#00244D',
		fontWeight: 'bold',
		fontSize: 16,
		fontFamily: 'Montserrat',
	},
	menu: {
		gap: 12,
	},
	menuItem: {
		backgroundColor: 'rgba(255,255,255,0.1)',
		padding: 16,
		borderRadius: 10,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	menuItemBottom: {
		marginBottom: 40,
		backgroundColor: 'rgba(255,255,255,0.1)',
		width: '100%',
		maxWidth: 350,
		padding: 16,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		alignSelf: 'center',
		borderRadius: 16,
	},
	menuText: {
		color: '#fff',
		fontSize: 16,
		fontFamily: 'Montserrat',
	},
	confirmQualification: {
		backgroundColor: '#FAFAFA',
		borderRadius: 10,
		padding: 16,
		marginTop: 10,
	},
	confirmQualificationText: {
		color: '#212121',
		fontSize: 16,
		fontFamily: 'Montserrat',
		textAlign: 'center',
		fontWeight: '600',
	},
	takeQualificationText: {
		color: '#FAFAFA',
		fontSize: 10,
		textAlign: 'center',
	},

	qualifiedInvestorText: {
		color: 'rgba(255,255,255,0.7)',
		fontSize: 12,
		fontFamily: 'Montserrat',
		textAlign: 'center',
	},
})
