import { useEffect, useRef, useState } from 'react'
import { Vibration } from 'react-native'
import Toast from 'react-native-toast-message'

import { useAuth } from '@/contexts/AuthContext'
import { useLoginByPinMutation } from '@/api/authApi'
import { useSetPinMutation } from '@/api/profileApi'
import { tokenService } from '@/utils/tokenService'
import { pinStorage } from '@/services/PinStorageService'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { useBiometricLogin } from '@/hooks/biometric/useBiometricLogin'
import { useBiometricAuth } from '@/hooks/biometric/useBiometricAuth'
import { useGetBiometricOptionsQuery } from '@/api/biometryApi'

export type PinStep = 'enter' | 'create' | 'confirm'

export function usePinFlow(onSuccess: () => void, onClose: () => void) {
	const [step, setStep] = useState<PinStep>('enter')
	const [pin, setPin] = useState('')
	const [newPin, setNewPin] = useState('')
	const [error, setError] = useState(false)

	const [phone, setPhone] = useState<string | null>(null)
	const [savedPin, setSavedPin] = useState<string | null>(null)

	const [isBioProcessing, setIsBioProcessing] = useState(false)
	const isLoggedInRef = useRef(false)
	const triedFaceIdRef = useRef(false)

	const { user, refetchUser } = useAuth()

	const [loginByPin, { isLoading: isLoginLoading }] = useLoginByPinMutation()
	const [installPin, { isLoading: isChangeLoading }] = useSetPinMutation()

	const { hasAnyBiometricEnabled, isLoading: isBiometricLoading } =
		useBiometricLogin()
	const { data: biometricOptions } = useGetBiometricOptionsQuery(undefined, {
		skip: !hasAnyBiometricEnabled,
	})

	const { handleBiometricLogin } = useBiometricAuth({
		mode: 'server',
		biometricOptionsLogin: biometricOptions,
		onLoginComplete: async success => {
			setIsBioProcessing(false)
			if (success) {
				await refetchUser()
				onSuccess()
			} else {
				Toast.show({
					type: 'error',
					text1: 'Ошибка Face ID',
					text2: 'Попробуйте войти вручную',
				})
			}
		},
	})

	useEffect(() => {
		const init = async () => {
			const localPin = await pinStorage.getPin()
			const localPhone = await pinStorage.getPhone()

			setPhone(localPhone)
			setSavedPin(localPin)

			// CASE 1: PIN сохранён локально → вход
			if (localPin) {
				setStep('enter')
				return
			}

			// CASE 2: PIN нет локально, но есть на сервере
			if (user?.hasPin === true) {
				setStep('enter')
				return
			}

			// CASE 3: PIN нет ни локально, ни на сервере
			setStep('create')
		}
		init()
	}, [user?.hasPin])

	useEffect(() => {
		const tryFaceIdOnce = async () => {
			if (
				triedFaceIdRef.current ||
				isLoggedInRef.current ||
				!hasAnyBiometricEnabled ||
				!biometricOptions ||
				isBiometricLoading ||
				isLoginLoading ||
				isChangeLoading ||
				step !== 'enter'
			)
				return

			triedFaceIdRef.current = true
			setIsBioProcessing(true)

			try {
				const success = await handleBiometricLogin()
				if (success) {
					isLoggedInRef.current = true
					await refetchUser()
					onSuccess()
				}
			} catch (e) {
				console.warn('FaceID error:', e)
			} finally {
				setIsBioProcessing(false)
			}
		}

		tryFaceIdOnce()
	}, [
		step,
		hasAnyBiometricEnabled,
		biometricOptions,
		isBiometricLoading,
		isLoginLoading,
		isChangeLoading,
		handleBiometricLogin,
	])

	useEffect(() => {
		if (pin.length === 4) {
			onSubmit()
		}
	}, [pin])

	const onDigit = (digit: string) => {
		if (pin.length < 4) {
			setPin(prev => prev + digit)
		}
	}

	const resetPin = () => {
		setPin('')
		setError(false)
	}

	const onSubmit = async () => {
		if (pin.length < 4) return

		if (step === 'enter') return loginFlow(pin)
		if (step === 'create') return createFlow(pin)
		if (step === 'confirm') return confirmFlow(pin)
	}

	const loginFlow = async (pin: string) => {
		if (!phone) {
			Toast.show({ type: 'error', text1: 'Телефон не найден' })
			return
		}

		try {
			const fcmToken = await AsyncStorage.getItem('fcmToken')
			const response = await loginByPin({ phone, pin, fcmToken }).unwrap()

			await tokenService.setTokens(response)
			await refetchUser()

			Toast.show({ type: 'success', text1: 'Вход выполнен' })
			onSuccess()
		} catch (err: any) {
			setError(true)
			Vibration.vibrate(100)
			Toast.show({
				type: 'error',
				text1: 'Неверный PIN-код',
			})
			setPin('')
		}
	}

	const createFlow = async (pin: string) => {
		setNewPin(pin)
		setPin('')
		setStep('confirm')
	}

	const confirmFlow = async (pin: string) => {
		if (pin !== newPin) {
			setError(true)
			Vibration.vibrate(100)
			Toast.show({ type: 'error', text1: 'PIN-коды не совпадают' })
			setPin('')
			setStep('create')
			return
		}

		try {
			await installPin({ pin }).unwrap()

			await pinStorage.setPin(pin)

			Toast.show({ type: 'success', text1: 'PIN-код установлен' })

			setStep('enter')
			setError(false)
			setSavedPin(pin)
			onSuccess()
		} catch (e) {
			setError(true)
			Toast.show({ type: 'error', text1: 'Ошибка установки PIN' })
		}
	}

	return {
		step,
		pin,
		error,
		isLoading: isLoginLoading || isChangeLoading || isBioProcessing,

		onDigit,
		resetPin,
		onSubmit,

		close: onClose,
	}
}
