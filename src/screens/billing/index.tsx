import { useCreateBillMutation } from '@/api/authApi'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import React, { useState, useCallback, useEffect } from 'react'
import {
	StyleSheet,
	View,
	Text,
	TouchableWithoutFeedback,
	KeyboardAvoidingView,
	Keyboard,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Toast from 'react-native-toast-message'
import { useBillingForm } from '../../hooks/useBillingForm'
import StepBankDetails from '../Registration/StepBankDetails'
import StepBiometry from '../Registration/StepBiometry'
import StepConfirmEmail from '../Registration/StepConfirmEmail'
import StepEmail from '../Registration/StepEmail'
import StepEmployment from '../Registration/StepEmployment'
import StepIndicator from '../Registration/StepIndicator'
import StepResidency from '../Registration/StepResidency'
import StepFinal from '../Registration/StepFinal'
import { billingProgressService } from '@/services/BillingProgressService'

const steps = [
	StepResidency,
	StepEmail,
	StepConfirmEmail,
	StepBiometry,
	StepEmployment,
	StepBankDetails,
]

const Billing = () => {
	const navigation = useNavigation()
	const form = useBillingForm()
	const [step, setStep] = useState(0)
	const [isFinished, setIsFinished] = useState(false)
	const [isRestoringProgress, setIsRestoringProgress] = useState(true)

	const [createBill] = useCreateBillMutation()

	const goNext = () => {
		if (step < steps.length - 1) {
			setStep(prev => prev + 1)
		} else {
			handleFinish()
		}
	}

	const goBack = useCallback(() => {
		if (step === 0) {
			navigation.goBack()
		} else {
			setStep(prev => Math.max(prev - 1, 0))
		}
	}, [step, navigation])

	const handleFinish = useCallback(async () => {
		try {
			const data = form.getValues()
			const storedPkb = await AsyncStorage.getItem('pkbResponse')
			const pkbResponse = storedPkb ? JSON.parse(storedPkb) : null

			const payload = {
				...data,
				pkbResponse,
			}

			await createBill(payload).unwrap()

			await billingProgressService.clearProgress()
			await AsyncStorage.removeItem('pkbResponse')

			Toast.show({
				type: 'success',
				text1: 'Счет успешно создан',
			})

			setIsFinished(true)
		} catch (err: any) {
			console.error('Create bill failed:', err)
			Toast.show({
				type: 'error',
				text1: 'Ошибка создания счета',
				text2: err.message || 'Попробуйте еще раз',
			})
		}
	}, [form, createBill])

	useEffect(() => {
		const restoreProgress = async () => {
			try {
				const progress = await billingProgressService.getProgress()
				if (progress) {
					console.log('Restoring billing progress:', progress)
					setStep(progress.step)
					if (progress.formData) {
						Object.keys(progress.formData).forEach(key => {
							const value = progress.formData[key]
							if (value !== undefined && value !== null && value !== '') {
								form.setValue(key as any, value)
							}
						})
					}
				}
			} catch (error) {
				console.error('Failed to restore progress:', error)
			} finally {
				setIsRestoringProgress(false)
			}
		}

		restoreProgress()
	}, [form])

	useEffect(() => {
		if (!isRestoringProgress && step >= 0) {
			const formData = form.getValues()
			billingProgressService.updateStep(step, formData)
		}
	}, [step, isRestoringProgress, form])

	const CurrentStep = steps[step]

	if (isRestoringProgress) {
		return (
			<View style={styles.loadingContainer}>
				<LinearGradient
					colors={['rgb(51, 118, 246)', 'rgb(9, 32, 68)', 'rgb(0, 0, 0)']}
					style={styles.background}
				>
					<Text style={styles.loadingText}>Загрузка...</Text>
				</LinearGradient>
			</View>
		)
	}

	if (isFinished) {
		return <StepFinal />
	}

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<KeyboardAvoidingView style={{ flex: 1 }}>
				<LinearGradient
					colors={['rgb(51, 118, 246)', 'rgb(9, 32, 68)', 'rgb(0, 0, 0)']}
					style={styles.background}
				>
					<View style={styles.overlay}>
						<StepIndicator
							total={steps.length}
							current={step}
							onBack={goBack}
						/>
						<CurrentStep form={form} onNext={goNext} onBack={goBack} />
					</View>
				</LinearGradient>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	)
}

export default Billing

const styles = StyleSheet.create({
	background: {
		flex: 1,
	},
	overlay: {
		flex: 1,
		paddingHorizontal: 24,
		paddingVertical: 16,
	},
	loadingContainer: {
		flex: 1,
	},
	loadingText: {
		color: '#fff',
		fontSize: 18,
		fontFamily: 'Montserrat',
		textAlign: 'center',
		marginTop: '50%',
	},
})
