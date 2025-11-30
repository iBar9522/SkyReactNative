import { useEffect, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { initializeFCM, listenForTokenRefresh } from '@/services/FcmService'

export function useFcmToken() {
	const [fcmToken, setFcmToken] = useState<string | null>(null)
	const initialized = useRef(false)

	useEffect(() => {
		const initFcm = async () => {
			if (initialized.current) return

			try {
				let token = await AsyncStorage.getItem('fcmToken')
				if (!token) {
					token = await initializeFCM()
					if (token) await AsyncStorage.setItem('fcmToken', token)
				}

				if (token) setFcmToken(token)

				const unsubscribe = listenForTokenRefresh(async (newToken: string) => {
					setFcmToken(newToken)
					await AsyncStorage.setItem('fcmToken', newToken)
				})

				initialized.current = true
				return unsubscribe
			} catch (err) {
				console.warn('FCM init error:', err)
			}
		}

		initFcm()
	}, [])

	return fcmToken
}
