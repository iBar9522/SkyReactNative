import { useRegisterMutation } from '@/api/authApi'
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
import { useRegistrationForm } from '../../hooks/useRegistrationForm'
import { useBiometricAuth } from '@/hooks/biometric/useBiometricAuth'

import StepCode from './StepCode'

import StepIndicator from './StepIndicator'
import StepPhone from './StepPhone'
import StepPin from './StepPin'
import { useGetBiometricRegistrationOptionsQuery } from '@/api/biometryApi'
import { tokenService } from '@/utils/tokenService'
import { useLazyGetUserProfileQuery } from '@/api/profileApi'
import { useAuth } from '@/contexts/AuthContext'
import СreateBill from './СreateBill'

import { registrationProgressService } from '@/services/RegistrationProgressService'

const steps = [StepPhone, StepCode, StepPin]

const Registration = () => {
	const navigation = useNavigation<any>()
	const form = useRegistrationForm()
	const [step, setStep] = useState(0)
	const [isFinished, setIsFinished] = useState(false)
	const [userId, setUserId] = useState<string | null>(null)
	const [isRestoringProgress, setIsRestoringProgress] = useState(true)
	const { setUser } = useAuth()
	const [register] = useRegisterMutation()
	const [triggerGetUserProfile] = useLazyGetUserProfileQuery()

	const {
		data: biometricOptions,
		isLoading: isLoadingBiometric,
		error: biometricError,
		refetch: refetchBiometricOptions,
	} = useGetBiometricRegistrationOptionsQuery(
		{ userId: userId! },
		{ skip: !userId }
	)

	const { showBiometricAlert } = useBiometricAuth({
		userId: userId || '',
		biometricOptionsRegistration: biometricOptions,
		onSetupComplete: () => setIsFinished(true),
	})

	const goNext = (onError?: () => void) => {
		if (step < steps.length - 1) {
			setStep(prev => prev + 1)
		} else {
			handleFinish(onError)
		}
	}

	const getOnNextForCurrentStep = () => {
		if (step === steps.length - 1) {
			return () => goNext(handleRegistrationError)
		}
		return goNext
	}

	const goBack = useCallback(() => {
		if (step === 0) {
			navigation.goBack()
		} else {
			setStep(prev => Math.max(prev - 1, 0))
		}
	}, [step, navigation])

	const handleFinish = useCallback(
		async (onError?: () => void) => {
			try {
				const data = form.getValues()
				const payload = {
					data,
				}

				const response = await register(payload).unwrap()

				await tokenService.setTokens({
					accessToken: response.tokens.naccessToken,
					refreshToken: response.tokens.refreshToken,
				})
				await new Promise(resolve => setTimeout(resolve, 2000))
				const userData = await triggerGetUserProfile().unwrap()
				setUser(userData)

				const newUserId = response?.id
				if (newUserId) {
					setUserId(newUserId)
					await registrationProgressService.clearProgress()
					Toast.show({ type: 'success', text1: 'Регистрация успешно прошла!' })
				} else {
					throw new Error('User ID not received from registration response')
				}
			} catch (err: any) {
				console.error('Registration failed:', err)
				Toast.show({
					type: 'error',
					text1: 'Ошибка регистрации',
					text2: err.message || 'Попробуйте еще раз',
				})

				if (onError) {
					onError()
				}
			}
		},
		[form, register]
	)

	const handleRegistrationError = useCallback(async () => {
		try {
			form.reset()
			await registrationProgressService.clearProgress()
			navigation.reset({
				index: 0,
				routes: [{ name: 'Welcome' }],
			})
		} catch (error) {
			console.error('Failed to handle registration error:', error)
		}
	}, [form, navigation])

	useEffect(() => {
		const restoreProgress = async () => {
			try {
				const progress = await registrationProgressService.getProgress()
				if (progress) {
					setStep(progress.step)
					if (progress.userId) {
						setUserId(progress.userId)
					}
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
			registrationProgressService.updateStep(step, formData)
		}
	}, [step, isRestoringProgress, form])

	useEffect(() => {
		if (userId && biometricOptions) {
			const timer = setTimeout(() => {
				showBiometricAlert()
			}, 1000)

			return () => clearTimeout(timer)
		}
	}, [userId, biometricOptions, showBiometricAlert])

	const CurrentStep = steps[step]

	if (isFinished) {
		return <СreateBill />
	}

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
		return <СreateBill />
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
						<CurrentStep
							form={form}
							onNext={getOnNextForCurrentStep()}
							onBack={goBack}
							onError={handleRegistrationError}
						/>
					</View>
				</LinearGradient>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	)
}

export default Registration

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
