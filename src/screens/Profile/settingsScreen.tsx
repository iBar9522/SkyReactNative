import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useEffect, useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Switch,
	ScrollView,
	ActivityIndicator,
	Alert,
} from 'react-native'
import Toast from 'react-native-toast-message'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'
import { useBiometricSettings } from '@/hooks/biometric/useBiometricSettings'
import { biometricStorage } from '@/services/BiometricService'
import { useAuth } from '@/contexts/AuthContext'
import { useBiometricAuth } from '@/hooks/biometric/useBiometricAuth'

export default function SettingsScreen() {
	const navigation = useNavigation<NativeStackNavigationProp<any>>()
	const { biometricEnabled, toggleBiometric, isProcessing } =
		useBiometricSettings()

	const { handleBiometricLogin } = useBiometricAuth({
		mode: 'local',
	})

	const { user } = useAuth()
	const [deviceInfo, setDeviceInfo] = useState<any>(null)

	useEffect(() => {
		const loadDeviceInfo = async () => {
			if (biometricEnabled && user?.id) {
				const info = await biometricStorage.getBiometricDeviceInfo(user.id)
				setDeviceInfo(info)
			} else {
				setDeviceInfo(null)
			}
		}
		loadDeviceInfo()
	}, [biometricEnabled, user?.id])

	const handleReregisterBiometric = () => {
		if (!user?.id) return

		Alert.alert(
			'Перерегистрировать Face ID?',
			'Это удалит текущую регистрацию Face ID и потребует настройки заново.',
			[
				{
					text: 'Отмена',
					style: 'cancel',
				},
				{
					text: 'Перерегистрировать',
					style: 'destructive',
					onPress: async () => {
						if (user?.id) {
							await biometricStorage.clearBiometricRegistration(user.id)
							setDeviceInfo(null)

							await toggleBiometric(false)
							Toast.show({
								type: 'info',
								text1: 'Face ID удален',
								text2: 'Включите биометрию для новой регистрации',
							})
						}
					},
				},
			]
		)
	}

	const handleChangePin = async () => {
		if (biometricEnabled && user?.id) {
			try {
				const success = await handleBiometricLogin()

				if (success) {
					navigation.navigate('ChangePin')
				} else {
					Toast.show({
						type: 'error',
						text1: 'Ошибка Face ID',
						text2: 'Не удалось подтвердить личность',
					})
				}
			} catch (e) {
				console.error('Ошибка Face ID:', e)
				Toast.show({
					type: 'error',
					text1: 'Ошибка Face ID',
					text2: 'Проверка не удалась',
				})
			}
		} else {
			navigation.navigate('ChangePin')
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
				<Text style={styles.headerTitle}>Настройки</Text>
				<View style={{ width: 24 }} />
			</View>

			<ScrollView contentContainerStyle={styles.scroll}>
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Безопасность</Text>

					<TouchableOpacity style={styles.linkButton} onPress={handleChangePin}>
						<Text style={[styles.linkText, styles.linkTextColored]}>
							Сменить ПИН-код
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.linkButton}
						onPress={() => navigation.navigate('ChangePasswordOld')}
					>
						<Text style={[styles.linkText, styles.linkTextColored]}>
							Сменить пароль
						</Text>
					</TouchableOpacity>

					<View style={styles.switchRow}>
						<Text style={styles.switchLabel}>Биометрия</Text>
						<View style={styles.switchContainer}>
							{isProcessing && (
								<ActivityIndicator
									size='small'
									color='#3376F6'
									style={styles.loadingIndicator}
								/>
							)}
							<Switch
								value={biometricEnabled}
								onValueChange={toggleBiometric}
								thumbColor='#fff'
								trackColor={{ false: '#555', true: '#3376F6' }}
								disabled={isProcessing}
							/>
						</View>
					</View>

					{biometricEnabled && deviceInfo && (
						<View style={styles.deviceInfoContainer}>
							<Text style={styles.deviceInfoLabel}>Face ID настроен на:</Text>
							<Text style={styles.deviceInfoText}>{deviceInfo.deviceName}</Text>
							<Text style={styles.deviceInfoDate}>
								Настроено:{' '}
								{new Date(deviceInfo.enabledAt).toLocaleDateString('ru-RU')}
							</Text>
							<Text style={styles.deviceInfoDate}>
								Последний вход:{' '}
								{new Date(deviceInfo.lastUsed).toLocaleDateString('ru-RU')}
							</Text>

							<TouchableOpacity
								style={styles.reregisterButton}
								onPress={handleReregisterBiometric}
								disabled={isProcessing}
							>
								<Text style={styles.reregisterText}>
									Перерегистрировать Face ID
								</Text>
								<Icon name='refresh' size={16} color='#FF6B6B' />
							</TouchableOpacity>
						</View>
					)}
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Уведомления</Text>
					<TouchableOpacity
						style={styles.linkButtonRow}
						onPress={() => navigation.navigate('Notifications')}
					>
						<Text style={styles.linkText}>Уведомления</Text>
						<Icon name='chevron-forward' size={20} color='#fff' />
					</TouchableOpacity>
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
		fontSize: 16,
		fontFamily: 'Montserrat',
		fontWeight: '600',
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
		fontFamily: 'Montserrat',
		fontWeight: '500',
		marginBottom: 12,
	},
	linkButton: {
		paddingVertical: 14,
		borderRadius: 10,
		backgroundColor: 'rgba(255, 255, 255, 0.05)',
		marginBottom: 12,
		paddingHorizontal: 16,
	},
	linkText: {
		color: '#fff',
		fontSize: 14,
		fontFamily: 'Montserrat',
		fontWeight: '500',
	},
	linkTextColored: {
		color: '#00F0B9',
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
	linkButtonRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 14,
		paddingHorizontal: 16,
		backgroundColor: 'rgba(255, 255, 255, 0.05)',
		borderRadius: 10,
	},
	switchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	loadingIndicator: {
		marginRight: 8,
	},
	deviceInfoContainer: {
		backgroundColor: 'rgba(255, 255, 255, 0.03)',
		borderRadius: 8,
		padding: 12,
		marginTop: 8,
		borderLeftWidth: 3,
		borderLeftColor: '#00F0B9',
	},
	deviceInfoLabel: {
		color: '#fff',
		fontSize: 12,
		fontFamily: 'Montserrat',
		fontWeight: '600',
		marginBottom: 4,
	},
	deviceInfoText: {
		color: '#00F0B9',
		fontSize: 14,
		fontFamily: 'Montserrat',
		fontWeight: '500',
		marginBottom: 2,
	},
	deviceInfoDate: {
		color: 'rgba(255, 255, 255, 0.7)',
		fontSize: 11,
		fontFamily: 'Montserrat',
		marginBottom: 1,
	},
	reregisterButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 12,
		paddingVertical: 8,
		paddingHorizontal: 12,
		backgroundColor: 'rgba(255, 107, 107, 0.1)',
		borderRadius: 6,
		borderWidth: 1,
		borderColor: 'rgba(255, 107, 107, 0.3)',
	},
	reregisterText: {
		color: '#FF6B6B',
		fontSize: 12,
		fontFamily: 'Montserrat',
		fontWeight: '500',
		marginRight: 6,
	},
})
