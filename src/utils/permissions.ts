import DeviceInfo from 'react-native-device-info'
import {
	check,
	request,
	PERMISSIONS,
	RESULTS,
	openSettings,
} from 'react-native-permissions'
import { Alert, Platform } from 'react-native'

export async function ensureCamMic(): Promise<boolean> {
	if (Platform.OS !== 'ios') return true
	const isSim = await DeviceInfo.isEmulator()
	if (isSim) return true

	try {
		const toCheck = [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE]
		for (const p of toCheck) {
			const s = await check(p)
			if (s === RESULTS.GRANTED || s === RESULTS.LIMITED) continue
			const r = await request(p)
			if (r !== RESULTS.GRANTED && r !== RESULTS.LIMITED) {
				Alert.alert(
					'Нет доступа',
					'Разрешите доступ к камере и микрофону в Настройки → Приложение',
					[
						{ text: 'Открыть настройки', onPress: () => openSettings() },
						{ text: 'Отмена' },
					]
				)
				return false
			}
		}
		return true
	} catch (e: any) {
		const msg = String(e?.message || e)
		if (__DEV__ && msg.includes('No permission handler detected')) return true
		throw e
	}
}
