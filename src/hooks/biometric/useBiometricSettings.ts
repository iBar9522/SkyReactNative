import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { biometricStorage } from '../../services/BiometricService'
import { useBiometricAuth } from './useBiometricAuth'
import { useGetBiometricRegistrationOptionsQuery } from '@/api/biometryApi'
import { useAuth } from '@/contexts/AuthContext'
import Toast from 'react-native-toast-message'

export function useBiometricSettings() {
	const [biometricEnabled, setBiometricEnabled] = useState(false)
	const [isProcessing, setIsProcessing] = useState(false)
	const { user } = useAuth()

	const { data: biometricOptions } = useGetBiometricRegistrationOptionsQuery(
		{ userId: user?.id || '' },
		{ skip: !user?.id }
	)

	const { handleBiometricSetup } = useBiometricAuth({
		userId: user?.id,
		biometricOptionsRegistration: biometricOptions,
		onSetupComplete: async (success?: boolean) => {
			setIsProcessing(false)
			
			if (success && user?.id) {
				await biometricStorage.setBiometricEnabled(user.id, true)
				setBiometricEnabled(true)
				Toast.show({
					type: 'success',
					text1: 'Биометрия настроена!',
					text2: 'Face ID успешно сохранен для входа',
				})
			} else if (success === false) {
				Toast.show({
					type: 'error',
					text1: 'Ошибка',
					text2: 'Не удалось настроить Face ID',
				})
				setBiometricEnabled(false)
			}
		},
	})

	useEffect(() => {
		const load = async () => {
			if (user?.id) {
				const isEnabled = await biometricStorage.getBiometricEnabled(user.id)
				setBiometricEnabled(isEnabled)
			} else {
				setBiometricEnabled(false)
			}
		}
		load()
	}, [user?.id])

	const toggleBiometric = async (value: boolean) => {
		if (isProcessing) return

		if (value) {
			if (!biometricOptions ) {
				Toast.show({
					type: 'error',
					text1: 'Ошибка',
					text2: 'Не удалось получить настройки биометрии',
				})
				return
			}

			Alert.alert(
				'Настроить Face ID?',
				'Это позволит входить в приложение с помощью Face ID',
				[
					{
						text: 'Отмена',
						style: 'cancel',
					},
					{
						text: 'Настроить',
						onPress: async () => {
							setIsProcessing(true)
							try {
								await handleBiometricSetup()
							} catch (error) {
								setIsProcessing(false)
								Toast.show({
									type: 'error',
									text1: 'Ошибка',
									text2: 'Не удалось настроить Face ID',
								})
							}
						},
					},
				]
			)
		} else {
			Alert.alert('Отключить Face ID?', 'Face ID будет отключен.', [
				{
					text: 'Отмена',
					style: 'cancel',
				},
				{
					text: 'Отключить',
					style: 'destructive',
					onPress: async () => {
						setBiometricEnabled(false)
						if (user?.id) {
							await biometricStorage.setBiometricEnabled(user.id, false)
						}
						Toast.show({
							type: 'info',
							text1: 'Face ID отключен',
							text2: 'Используйте пароль для входа',
						})
					},
				},
			])
		}
	}

	return {
		biometricEnabled,
		toggleBiometric,
		isProcessing,
	}
}
