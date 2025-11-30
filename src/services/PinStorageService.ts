import AsyncStorage from '@react-native-async-storage/async-storage'

const PIN_KEY = 'user_pin'
const PHONE_KEY = 'user_phone'

export const pinStorage = {
	async setPin(pin: string) {
		await AsyncStorage.setItem(PIN_KEY, pin)
	},
	async getPin(): Promise<string | null> {
		return AsyncStorage.getItem(PIN_KEY)
	},
	async removePin() {
		await AsyncStorage.removeItem(PIN_KEY)
	},
	async setPhone(phone: string) {
		await AsyncStorage.setItem(PHONE_KEY, phone)
	},
	async getPhone(): Promise<string | null> {
		return AsyncStorage.getItem(PHONE_KEY)
	},
	async clear() {
		await AsyncStorage.multiRemove([PIN_KEY, PHONE_KEY])
	},
}
