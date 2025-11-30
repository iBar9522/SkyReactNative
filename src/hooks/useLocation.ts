import { useEffect, useState } from 'react'
import { Alert, Linking, Platform } from 'react-native'
import Geolocation from '@react-native-community/geolocation'
import {
	PERMISSIONS,
	RESULTS,
	check,
	request,
	openSettings,
} from 'react-native-permissions'

export function useLocation() {
	const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
		null
	)

	useEffect(() => {
		const getPermission = async () => {
			try {
				const permission =
					Platform.OS === 'ios'
						? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
						: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION

				const status = await check(permission)

				switch (status) {
					case RESULTS.GRANTED:
						getCurrentLocation()
						break

					case RESULTS.DENIED:
						const newStatus = await request(permission)
						if (newStatus === RESULTS.GRANTED) getCurrentLocation()
						break

					case RESULTS.BLOCKED:
						Alert.alert(
							'Доступ к геолокации отключён',
							'Чтобы включить определение местоположения, перейдите в настройки приложения.',
							[
								{ text: 'Отмена', style: 'cancel' },
								{
									text: 'Открыть настройки',
									onPress: () => {
										if (Platform.OS === 'ios') {
											Linking.openURL('app-settings:')
										} else {
											openSettings()
										}
									},
								},
							]
						)
						break
				}
			} catch (err) {
				console.warn('Ошибка при запросе разрешения:', err)
			}
		}

		const getCurrentLocation = () => {
			Geolocation.getCurrentPosition(
				pos => {
					const { latitude, longitude } = pos.coords
					setLocation({ lat: latitude, lon: longitude })
				},
				error => {
					console.error('Ошибка при получении координат:', error)
				},
				{ enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
			)
		}

		getPermission()
	}, [])

	return location
}
