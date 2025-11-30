import AsyncStorage from '@react-native-async-storage/async-storage'

const BILLING_PROGRESS_KEY = '@billing_progress'

export interface BillingProgress {
	step: number
	formData?: any
	timestamp: number
}

class BillingProgressService {
	async saveProgress(progress: BillingProgress): Promise<void> {
		try {
			await AsyncStorage.setItem(
				BILLING_PROGRESS_KEY,
				JSON.stringify({
					...progress,
					timestamp: Date.now(),
				})
			)
		} catch (error) {
			console.error('Failed to save billing progress:', error)
		}
	}

	async getProgress(): Promise<BillingProgress | null> {
		try {
			const data = await AsyncStorage.getItem(BILLING_PROGRESS_KEY)
			if (!data) return null

			const progress: BillingProgress = JSON.parse(data)

		
			const weekInMs = 7 * 24 * 60 * 60 * 1000
			if (Date.now() - progress.timestamp > weekInMs) {
				await this.clearProgress()
				return null
			}

			return progress
		} catch (error) {
			console.error('Failed to get billing progress:', error)
			return null
		}
	}

	async clearProgress(): Promise<void> {
		try {
			await AsyncStorage.removeItem(BILLING_PROGRESS_KEY)
		} catch (error) {
			console.error('Failed to clear billing progress:', error)
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

export const billingProgressService = new BillingProgressService()

