import { useCallback, useState, useRef } from 'react'
import { Alert } from 'react-native'
import Toast from 'react-native-toast-message'
import {
	Passkey,
	PasskeyCreateRequest,
	PasskeyCreateResult,
	PasskeyGetRequest,
	PasskeyGetResult,
} from 'react-native-passkey'
import {
	useRegisterBiometricMutation,
	useBiometricLoginMutation,
} from '@/api/biometryApi'
import { biometricStorage } from '@/services/BiometricService'
import { tokenService } from '@/utils/tokenService'
import { useLazyGetUserProfileQuery } from '@/api/profileApi'
import { useAuth } from '@/contexts/AuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ReactNativeBiometrics from 'react-native-biometrics'

type Mode = 'server' | 'local'

interface UseBiometricAuthProps {
	mode?: Mode
	userId?: string
	biometricOptionsRegistration?: any
	onSetupComplete?: (success?: boolean) => void
	biometricOptionsLogin?: any
	onLoginComplete?: (success: boolean) => void
}

export const useBiometricAuth = ({
	mode = 'server',
	userId,
	biometricOptionsRegistration,
	onSetupComplete,
	biometricOptionsLogin,
	onLoginComplete,
}: UseBiometricAuthProps = {}) => {
	const [isSettingUp, setIsSettingUp] = useState(false)
	const [isAlertShown, setIsAlertShown] = useState(false)
	const [isLoggingIn, setIsLoggingIn] = useState(false)
	const [isLoginCancelled, setIsLoginCancelled] = useState(false)

	const processingRef = useRef(false)
	const hasPromptBeenShownRef = useRef(false)

	const { setUser } = useAuth()
	const [registerBiometric] = useRegisterBiometricMutation()
	const [biometricLogin] = useBiometricLoginMutation()
	const [triggerGetUserProfile] = useLazyGetUserProfileQuery()

	const handleBiometricSetup = useCallback(async () => {
		if (
			!userId ||
			!biometricOptionsRegistration ||
			isSettingUp ||
			processingRef.current
		) {
			console.warn(
				'Biometric setup skipped: missing data or already in progress'
			)
			return
		}

		processingRef.current = true
		setIsSettingUp(true)

		try {
			const isSupported = await Passkey.isSupported()
			if (!isSupported)
				throw new Error('Passkeys не поддерживаются на этом устройстве')

			const createRequest: PasskeyCreateRequest = {
				challenge: biometricOptionsRegistration.challenge,
				rp: biometricOptionsRegistration.rp,
				user: biometricOptionsRegistration.user,
				pubKeyCredParams: biometricOptionsRegistration.pubKeyCredParams || [
					{ type: 'public-key', alg: -7 },
					{ type: 'public-key', alg: -257 },
				],
				timeout: biometricOptionsRegistration.timeout || 60000,
				attestation: biometricOptionsRegistration.attestation || 'none',
				authenticatorSelection: {
					authenticatorAttachment:
						biometricOptionsRegistration.authenticatorSelection
							?.authenticatorAttachment || 'platform',
					userVerification:
						biometricOptionsRegistration.authenticatorSelection
							?.userVerification || 'required',
					residentKey:
						biometricOptionsRegistration.authenticatorSelection?.residentKey ||
						'preferred',
				},
			}

			const createResult: PasskeyCreateResult = await Passkey.create(
				createRequest
			)

			const registrationData = {
				userId,
				challenge: biometricOptionsRegistration.challenge,
				biometricAttestation: {
					id: createResult.id,
					rawId: createResult.rawId,
					response: {
						clientDataJSON: createResult.response.clientDataJSON,
						attestationObject: createResult.response.attestationObject,
					},
					type: createResult.type,
					transports: ['internal'],
				},
			}

			const response = await registerBiometric(registrationData).unwrap()

			await tokenService.setTokens({
				accessToken: response.accessToken,
				refreshToken: response.refreshToken,
			})

			const userData = await triggerGetUserProfile().unwrap()
			setUser(userData)

			await biometricStorage.setBiometricEnabled(userId, true)
			await biometricStorage.setBiometricDeviceInfo(userId, {
				deviceName: 'iOS Device',
				enabledAt: new Date().toISOString(),
				lastUsed: new Date().toISOString(),
			})

			Toast.show({
				type: 'success',
				text1: 'Биометрия настроена!',
				text2: 'Теперь вы можете входить с помощью Face ID / Touch ID',
			})

			onSetupComplete?.(true)
		} catch (error: any) {
			console.error('Biometric setup error:', error)
			if (error.code !== 'UserCancel') {
				Toast.show({
					type: 'error',
					text1: 'Ошибка настройки биометрии',
					text2: error.message || 'Попробуйте ещё раз',
				})
			}
			onSetupComplete?.(false)
		} finally {
			setIsSettingUp(false)
			processingRef.current = false
		}
	}, [userId, biometricOptionsRegistration, isSettingUp, registerBiometric])

	const handleBiometricLogin = useCallback(async (): Promise<boolean> => {
		if (isLoggingIn || processingRef.current) return false

		processingRef.current = true
		setIsLoggingIn(true)
		setIsLoginCancelled(false)

		try {
			const rnBiometrics = new ReactNativeBiometrics()
			const { available, biometryType } = await rnBiometrics.isSensorAvailable()

			if (!available || !biometryType) {
				Toast.show({
					type: 'error',
					text1: 'Face ID недоступен',
					text2: 'Попробуйте позже',
				})
				return false
			}

			const { success } = await rnBiometrics.simplePrompt({
				promptMessage: 'Подтвердите личность',
				cancelButtonText: 'Отмена',
			})

			if (!success) {
				Toast.show({ type: 'info', text1: 'Face ID отклонён' })
				onLoginComplete?.(false)
				return false
			}

			if (mode === 'local') {
				onLoginComplete?.(true)
				return true
			}

			if (mode === 'server') {
				if (!biometricOptionsLogin?.challenge) {
					Toast.show({
						type: 'error',
						text1: 'Ошибка авторизации',
						text2: 'Отсутствует challenge от сервера',
					})
					return false
				}

				const isSupported = await Passkey.isSupported()
				if (!isSupported)
					throw new Error('Passkey не поддерживается на этом устройстве')

				const assertion = await Passkey.get({
					challenge: biometricOptionsLogin.challenge,
					rpId: biometricOptionsLogin.rpId,
					userVerification: 'required',
					timeout: 60000,
				})

				const deviceToken = await AsyncStorage.getItem('fcmToken')

				const payload = {
					challenge: biometricOptionsLogin.challenge,
					deviceToken,
					biometricAssertion: {
						id: assertion.id,
						rawId: assertion.rawId,
						type: assertion.type,
						response: {
							clientDataJSON: assertion.response.clientDataJSON,
							authenticatorData: assertion.response.authenticatorData,
							signature: assertion.response.signature,
							userHandle: assertion.response.userHandle,
						},
					},
				}

				const loginResult = await biometricLogin(payload).unwrap()

				await tokenService.setTokens({
					accessToken: loginResult.accessToken,
					refreshToken: loginResult.refreshToken,
				})

				const userData = await triggerGetUserProfile().unwrap()
				setUser(userData)

				onLoginComplete?.(true)
				return true
			}

			return false
		} catch (error: any) {
			console.error('Biometric login error:', error)

			if (
				error?.code === 'UserCancel' ||
				error?.message?.includes('AbortError')
			) {
				setIsLoginCancelled(true)
			}

			Toast.show({
				type: 'error',
				text1: 'Ошибка Face ID',
				text2: error?.message || 'Не удалось выполнить вход',
			})

			onLoginComplete?.(false)
			return false
		} finally {
			setIsLoggingIn(false)
			processingRef.current = false
		}
	}, [
		mode,
		biometricOptionsLogin,
		isLoggingIn,
		biometricLogin,
		onLoginComplete,
	])

	const showBiometricAlert = useCallback(async () => {
		if (isAlertShown || processingRef.current) return
		setIsAlertShown(true)

		try {
			const isSupported = await Passkey.isSupported()
			if (isSupported) {
				Alert.alert(
					'Настройка биометрии',
					'Хотите включить Face ID / Touch ID для быстрого входа?',
					[
						{
							text: 'Нет',
							style: 'cancel',
							onPress: () => onSetupComplete?.(false),
						},
						{ text: 'Да', onPress: handleBiometricSetup },
					]
				)
			} else {
				Toast.show({
					type: 'info',
					text1: 'Биометрия не поддерживается',
					text2: 'Ваше устройство не поддерживает Passkeys',
				})
				onSetupComplete?.(false)
			}
		} catch (error) {
			console.error('Passkey support check failed:', error)
			onSetupComplete?.(false)
		}
	}, [isAlertShown, handleBiometricSetup, onSetupComplete])

	return {
		isSettingUp,
		isLoggingIn,
		isLoginCancelled,
		handleBiometricLogin,
		showBiometricAlert,
		handleBiometricSetup,
	}
}
