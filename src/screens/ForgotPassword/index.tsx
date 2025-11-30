import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
	StyleSheet,
	View,
	KeyboardAvoidingView,
	TouchableWithoutFeedback,
	Keyboard,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import StepCode from './StepCode'
import StepNewPassword from './StepNewPassword'
import StepPhone from './StepPhone'
import StepSuccess from './StepSuccess'

export type ForgotPasswordForm = {
	phone: string
	verifyCode?: string
	password?: string
	confirmPassword: string
}

const ForgotPasswordScreen = () => {
	const [step, setStep] = useState(0)
	const form = useForm<ForgotPasswordForm>({ defaultValues: {} })
	const insets = useSafeAreaInsets()
  const [verifyCode, setVerifyCode] = useState('');
	const nextStep = () => {
	
		setStep(prev => prev + 1)
	}
	const prevStep = () => {

		setStep(prev => prev - 1)
	}

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<KeyboardAvoidingView style={{ flex: 1 }}>
				<LinearGradient
					colors={['rgb(51, 118, 246)', 'rgb(9, 32, 68)', 'rgb(0, 0, 0)']}
					style={styles.background}
				>
					<View
						style={{
							flex: 1,
							paddingTop: insets.top - 40,
							paddingBottom: insets.bottom,
							paddingHorizontal: 20,
						}}
					>
						{step === 0 && <StepPhone form={form} onNext={nextStep} />}
						{step === 1 && (
							<StepCode form={form} setVerifyCode={setVerifyCode} onNext={nextStep} onBack={prevStep} />
						)}
						{step === 2 && (
							<StepNewPassword
								form={form}
								verifyCodeCheck={verifyCode}
								onNext={nextStep}
								onBack={prevStep}
							/>
						)}
						{step === 3 && <StepSuccess />}
					</View>
				</LinearGradient>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	)
}

export default ForgotPasswordScreen

const styles = StyleSheet.create({
	background: {
		flex: 1,
	},
})
