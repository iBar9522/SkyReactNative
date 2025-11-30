import PhoneInputWithCountry from '@/components/PhoneInputWithCountry'
import { useAuth } from '@/contexts/AuthContext'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
	ImageBackground,
	Image,
	Keyboard,
	KeyboardAvoidingView,
	StyleSheet,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
	Modal,
} from 'react-native'
import FormInput from '../components/FormInput'
import PrimaryButton from '../components/PrimaryButton'

import EyeSlashIcon from '@/assets/eye-slash.svg'
import EyeIcon from '@/assets/eye.svg'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { pinStorage } from '@/services/PinStorageService'
import PinLoginModal from '@/components/PinLoginModal'
import ReactNativeBiometrics from 'react-native-biometrics'
import { biometricStorage } from '@/services/BiometricService'

type LoginForm = {
	phone: string
	password: string
}

export default function LoginScreen({ navigation }: any) {
	const { control, handleSubmit } = useForm<LoginForm>()
	const { login } = useAuth()
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showPinSetupModal, setShowPinSetupModal] = useState(false)

	useEffect(() => {
		const checkSavedPin = async () => {
			try {
				const savedPin = await pinStorage.getPin()
				if (savedPin) {
					setShowPinSetupModal(true)
				}
			} catch (error) {
				console.warn('Ошибка при проверке PIN:', error)
			}
		}

		checkSavedPin()
	}, [])

	const onSubmit = async (data: LoginForm) => {
		try {
			setIsLoading(true)
			await login(data)
			await pinStorage.setPhone(data.phone)

			await new Promise(res => setTimeout(res, 100))
			const savedPin = await pinStorage.getPin()

			if (!savedPin) {
				setShowPinSetupModal(true)
				return
			}
			navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] })
		} catch (error: any) {
			const code = error?.response?.data?.code

			if (code === 'AUTH.INVALID_CREDENTIALS') {
				Toast.show({
					type: 'error',
					text1: 'Неверный логин или пароль',
				})
			} else if (code === 'AUTH.USER_NOT_FOUND') {
				Toast.show({
					type: 'error',
					text1: 'Пользователь не найден',
				})
			} else if (code === 'AUTH.BLOCKED') {
				Toast.show({
					type: 'error',
					text1: 'Ваш аккаунт заблокирован',
				})
			} else {
				Toast.show({
					type: 'error',
					text1: 'Ошибка входа',
					text2: 'Попробуйте позже или проверьте соединение',
				})
			}
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<SafeAreaView style={styles.container} edges={['left', 'right']}>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<KeyboardAvoidingView style={{ flex: 1 }}>
					<ImageBackground
						source={require('../assets/main_background.png')}
						resizeMode='cover'
						style={styles.background}
					>
						<View style={styles.content}>
							<View style={styles.logoContainer}>
								<Image
									source={require('../assets/logo_sbi.png')}
									style={styles.logo}
									resizeMode='contain'
								/>
							</View>
							<Text style={styles.title}>
								Надёжный доступ к вашему аккаунту
							</Text>

							<PhoneInputWithCountry name='phone' control={control} />

							<Controller
								control={control}
								name='password'
								rules={{ required: 'Введите пароль' }}
								render={({
									field: { onChange, value },
									fieldState: { error },
								}) => (
									<View style={styles.inputWrapper}>
										<FormInput
											placeholder='Пароль'
											secureTextEntry={!showPassword}
											value={value}
											textContentType='none'
											onChangeText={onChange}
											error={error?.message}
										/>
										<TouchableOpacity
											onPress={() => setShowPassword(v => !v)}
											style={styles.eyeButton}
										>
											{showPassword ? (
												<EyeIcon style={styles.eyeIcon} />
											) : (
												<EyeSlashIcon style={styles.eyeIcon} />
											)}
										</TouchableOpacity>
									</View>
								)}
							/>

							<TouchableOpacity
								style={styles.forgotPassword}
								onPress={() => navigation.navigate('ForgotPassword')}
							>
								<Text style={styles.forgotPasswordText}>Забыли пароль?</Text>
							</TouchableOpacity>
						</View>

						<View style={styles.footer}>
							<PrimaryButton
								title='Войти'
								onPress={handleSubmit(onSubmit)}
								loading={isLoading}
							/>

							<TouchableOpacity onPress={() => navigation.navigate('Register')}>
								<Text style={styles.linkText}>Зарегистрироваться</Text>
							</TouchableOpacity>
						</View>

						<Modal
							visible={showPinSetupModal}
							transparent
							animationType='slide'
							onRequestClose={() => setShowPinSetupModal(false)}
						>
							<PinLoginModal
								onSuccess={() => {
									setShowPinSetupModal(false)
									navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] })
								}}
								onClose={() => setShowPinSetupModal(false)}
							/>
						</Modal>
					</ImageBackground>
				</KeyboardAvoidingView>
			</TouchableWithoutFeedback>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: 'black' },
	background: {
		flex: 1,
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 36,
	},
	content: { flex: 1, justifyContent: 'center' },
	logoContainer: {
		width: '100%',
		alignItems: 'center',
		marginTop: -120,
	},
	logo: {
		width: 200,
		height: 200,
		marginBottom: 20,
		justifyContent: 'center',
	},
	inputWrapper: { position: 'relative' },
	title: {
		fontFamily: 'Montserrat',
		fontWeight: 'bold',
		lineHeight: 40,
		letterSpacing: 1,
		textAlign: 'center',
		color: '#fff',
		fontSize: 24,
		marginBottom: 24,
		width: 270,
		marginHorizontal: 'auto',
	},
	eyeButton: {
		position: 'absolute',
		right: 10,
		top: 20,
		transform: [{ translateY: -10 }],
		padding: 4,
		zIndex: 1,
	},
	eyeIcon: { width: 22, height: 22, tintColor: '#fff' },
	forgotPassword: { alignSelf: 'flex-end' },
	forgotPasswordText: {
		color: '#fff',
		fontSize: 13,
		fontFamily: 'Montserrat',
		fontWeight: '500',
		textDecorationLine: 'underline',
	},
	footer: { gap: 12, paddingBottom: 24 },
	linkText: {
		fontFamily: 'Montserrat',
		color: 'white',
		fontSize: 14,
		fontWeight: '600',
		lineHeight: 22,
		textAlign: 'center',
		textDecorationLine: 'underline',
	},
})
