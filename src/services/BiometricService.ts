import AsyncStorage from '@react-native-async-storage/async-storage'

const BIOMETRIC_ENABLED_PREFIX = 'biometric_enabled_'
const BIOMETRIC_DEVICE_INFO_PREFIX = 'biometric_device_info_'

export const biometricStorage = {
  async setBiometricEnabled(userId: string, value: boolean): Promise<void> {
    if (!userId) {
      throw new Error('userId is required for biometric settings')
    }
    const key = `${BIOMETRIC_ENABLED_PREFIX}${userId}`
    await AsyncStorage.setItem(key, value.toString())
  },

  async getBiometricEnabled(userId: string): Promise<boolean> {
    if (!userId) {
      return false
    }
    const key = `${BIOMETRIC_ENABLED_PREFIX}${userId}`
    const value = await AsyncStorage.getItem(key)
    return value === 'true'
  },

  async clearBiometricData(userId: string): Promise<void> {
    if (!userId) return
    const enabledKey = `${BIOMETRIC_ENABLED_PREFIX}${userId}`
    const deviceInfoKey = `${BIOMETRIC_DEVICE_INFO_PREFIX}${userId}`
    await Promise.all([
      AsyncStorage.removeItem(enabledKey),
      AsyncStorage.removeItem(deviceInfoKey)
    ])
  },

  async setBiometricDeviceInfo(userId: string, deviceInfo: any): Promise<void> {
    if (!userId) return
    const key = `${BIOMETRIC_DEVICE_INFO_PREFIX}${userId}`
    await AsyncStorage.setItem(key, JSON.stringify(deviceInfo))
  },

  async getBiometricDeviceInfo(userId: string): Promise<any> {
    if (!userId) return null
    const key = `${BIOMETRIC_DEVICE_INFO_PREFIX}${userId}`
    const value = await AsyncStorage.getItem(key)
    return value ? JSON.parse(value) : null
  },

  async clearBiometricRegistration(userId: string): Promise<void> {
    if (!userId) return
    const deviceInfoKey = `${BIOMETRIC_DEVICE_INFO_PREFIX}${userId}`
    await AsyncStorage.removeItem(deviceInfoKey)
  },

  async hasAnyBiometricEnabled(): Promise<boolean> {
    try {
      const allKeys = await AsyncStorage.getAllKeys()
      const biometricKeys = allKeys.filter(key => key.startsWith(BIOMETRIC_ENABLED_PREFIX))
      
      for (const key of biometricKeys) {
        const value = await AsyncStorage.getItem(key)
        if (value === 'true') {
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Error checking biometric enabled status:', error)
      return false
    }
  }
}
