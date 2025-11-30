import messaging from '@react-native-firebase/messaging'
import firebase from '@react-native-firebase/app'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'

export async function getDeviceFCMToken(): Promise<string> {
	try {
		await messaging().registerDeviceForRemoteMessages()

		const stored = await AsyncStorage.getItem('fcmToken')
		if (stored) return stored

		const token = await messaging().getToken()
		if (token) {
			await AsyncStorage.setItem('fcmToken', token)
			return token
		}

		return ''
	} catch (error) {
		console.warn('getDeviceFCMToken error:', error)
		return ''
	}
}

export function listenForTokenRefresh(
	onToken: (newToken: string) => void
): () => void {
	const unsubscribe = messaging().onTokenRefresh(onToken)
	return unsubscribe
}

export async function initializeFCM(
	onCustomData?: (data: any) => void
): Promise<string> {
	try {
		if (!firebase.apps.length) {
			const app = await firebase.initializeApp()
		}

		const authStatus = await messaging().requestPermission()
		const enabled =
			authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
			authStatus === messaging.AuthorizationStatus.PROVISIONAL

		if (!enabled) {
			console.warn('Push permissions not granted.')
			return ''
		}

		const token = await getDeviceFCMToken()

		messaging().onMessage(async remoteMessage => {
			const data = remoteMessage.data || {}

			let toastType: 'success' | 'error' | 'info' = 'info'
			switch (data.status) {
				case 'success':
					toastType = 'success'
					break
				case 'error':
					toastType = 'error'
					break
				case 'info':
				default:
					toastType = 'info'
					break
			}

			if (onCustomData) onCustomData(data)

			if (data.type === 'in_app') {
				Toast.show({
					type: toastType,
					text1: String(data?.title || 'Уведомление'),
					text2: String(data?.description),
				})
				return
			}
		})

		return token
	} catch (error) {
		console.error('Failed to initialize FCM:', error)
		return ''
	}
}
