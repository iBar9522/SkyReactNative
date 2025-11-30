import AsyncStorage from '@react-native-async-storage/async-storage'

const REGISTRATION_PROGRESS_KEY = '@registration_progress'

export interface RegistrationProgress {
	step: number
	userId?: string
	formData?: any
	timestamp: number
}

class RegistrationProgressService {
	async saveProgress(progress: RegistrationProgress): Promise<void> {
		try {
			await AsyncStorage.setItem(
				REGISTRATION_PROGRESS_KEY,
				JSON.stringify({
					...progress,
					timestamp: Date.now(),
				})
			)
		} catch (error) {
			console.error('Failed to save registration progress:', error)
		}
	}

	async getProgress(): Promise<RegistrationProgress | null> {
		try {
			const data = await AsyncStorage.getItem(REGISTRATION_PROGRESS_KEY)
			if (!data) return null

			const progress: RegistrationProgress = JSON.parse(data)

		
			const weekInMs = 7 * 24 * 60 * 60 * 1000
			if (Date.now() - progress.timestamp > weekInMs) {
				await this.clearProgress()
				return null
			}

			return progress
		} catch (error) {
			console.error('Failed to get registration progress:', error)
			return null
		}
	}

	async clearProgress(): Promise<void> {
		try {
			await AsyncStorage.removeItem(REGISTRATION_PROGRESS_KEY)
		} catch (error) {
			console.error('Failed to clear registration progress:', error)
		}
	}

	async updateStep(step: number, formData?: any): Promise<void> {
		try {
			const progress = await this.getProgress()
			if (progress) {
				await this.saveProgress({
					...progress,
					step,
					formData: formData || progress.formData,
				})
			} else {
				await this.saveProgress({
					step,
					formData,
					timestamp: Date.now(),
				})
			}
		} catch (error) {
			console.error('Failed to update step:', error)
		}
	}
}

export const registrationProgressService = new RegistrationProgressService()


export const clearAllAsyncStorage = async () => {
	try {
		await AsyncStorage.clear()
		console.log('AsyncStorage cleared successfully')
	} catch (error) {
		console.error('Failed to clear AsyncStorage:', error)
	}
}

