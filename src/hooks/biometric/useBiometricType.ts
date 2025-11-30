import ReactNativeBiometrics, { BiometryType } from 'react-native-biometrics'
import { useEffect, useState } from 'react'

export function useBiometricType() {
	const [biometricType, setBiometricType] = useState<BiometryType | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const checkType = async () => {
			try {
				const rnBiometrics = new ReactNativeBiometrics()
				const { available, biometryType } =
					await rnBiometrics.isSensorAvailable()

				if (available && biometryType) {
					setBiometricType(biometryType)
				} else {
					setBiometricType(null)
				}
			} catch (e) {
				console.warn('Biometric check failed', e)
				setBiometricType(null)
			} finally {
				setIsLoading(false)
			}
		}

		checkType()
	}, [])

	return { biometricType, isLoading }
}
