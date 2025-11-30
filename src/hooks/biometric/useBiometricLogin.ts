import { useEffect, useState } from 'react'
import { biometricStorage } from '../../services/BiometricService'

/**
 * Хук для проверки возможности биометрического входа на экране логина
 * Используется когда пользователь ещё не авторизован
 */
export function useBiometricLogin() {
	const [hasAnyBiometricEnabled, setHasAnyBiometricEnabled] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const checkBiometricStatus = async () => {
			try {
				setIsLoading(true)
				const hasAny = await biometricStorage.hasAnyBiometricEnabled()
				setHasAnyBiometricEnabled(hasAny)
			} catch (error) {
				console.error('Error checking biometric status:', error)
				setHasAnyBiometricEnabled(false)
			} finally {
				setIsLoading(false)
			}
		}

		checkBiometricStatus()
	}, [])

	return {
		hasAnyBiometricEnabled,
		isLoading,
	}
}
