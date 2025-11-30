import React, { useState } from 'react'
import { Controller, UseFormReturn } from 'react-hook-form'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import FormInput from '../../components/FormInput'
import PrimaryButton from '../../components/PrimaryButton'
import { ForgotPasswordForm } from './index'
import { useResetPasswordByPhoneMutation } from '@/api/authApi'
import Toast from 'react-native-toast-message'
import Icon from 'react-native-vector-icons/Ionicons'

type Props = {
	form: UseFormReturn<ForgotPasswordForm>
	onNext: () => void
	onBack: () => void
	verifyCodeCheck: string
}

const StepNewPassword: React.FC<Props> = ({ form, onNext, onBack, verifyCodeCheck }) => {
	const { control, handleSubmit, watch, getValues } = form
	const password = watch('password')
	const phone = getValues('phone')
	const verifyCode = getValues('verifyCode')

	const [showPassword, setShowPassword] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)

	const [resetPassword] = useResetPasswordByPhoneMutation()

	const onSubmit = async () => {
		const password = getValues('password')
		try {
			await resetPassword({
				password,
				phone,
				verifyCode: verifyCodeCheck
	
			}).unwrap()
			Toast.show({
				type: 'success',
				text1: 'Пароль обновлён',
			})
			onNext()
		} catch (error: any) {
			console.warn(error)
		}
	}

	return (
		<View style={styles.container}>
			<View style={styles.containerHeader}>
				<TouchableOpacity style={styles.backButton} onPress={onBack}>
					<Icon name='arrow-back' size={24} color='#fff' />
				</TouchableOpacity>
				<Text style={styles.title}>Новый пароль</Text>
			</View>

			<View>
				<Text style={styles.subtitle}>
					Создайте новый пароль для входа в ваш аккаунт
				</Text>

				<Controller
					name='password'
					control={control}
					rules={{ required: 'Введите пароль' }}
					render={({ field: { value, onChange }, fieldState: { error } }) => (
						<View style={styles.inputWrapper}>
							<FormInput
								placeholder='Новый пароль'
								secureTextEntry={!showPassword}
								value={value}
								onChangeText={onChange}
								style={[styles.input, { paddingRight: 45 }]}
								error={error?.message}
							/>
							<TouchableOpacity
								onPress={() => setShowPassword(prev => !prev)}
								style={styles.eyeButton}
							>
								<Image
									source={
										showPassword
											? require('../../assets/eye.png')
											: require('../../assets/eye-slash.png')
									}
								/>
							</TouchableOpacity>
						</View>
					)}
				/>

				<Controller
					name='confirmPassword'
					control={control}
					rules={{
						required: 'Повторите пароль',
						validate: value => value === password || 'Пароли не совпадают',
					}}
					render={({ field: { value, onChange }, fieldState: { error } }) => (
						<View style={styles.inputWrapper}>
							<FormInput
								placeholder='Повторите пароль'
								secureTextEntry={!showConfirm}
								value={value}
								onChangeText={onChange}
								style={[styles.input, { paddingRight: 45 }]}
								error={error?.message}
							/>
							<TouchableOpacity
								onPress={() => setShowConfirm(prev => !prev)}
								style={styles.eyeButton}
							>
								<Image
									source={
										showConfirm
											? require('../../assets/eye.png')
											: require('../../assets/eye-slash.png')
									}
								/>
							</TouchableOpacity>
						</View>
					)}
				/>
			</View>

			<PrimaryButton
				title='Сохранить пароль'
				onPress={handleSubmit(onSubmit)}
			/>
		</View>
	)
}

export default StepNewPassword

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 36,
		justifyContent: 'space-between',
	},
	containerHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 24,
	},
	backButton: {
		marginRight: 20,
	},
	title: {
		fontSize: 20,
		fontFamily: 'Montserrat',
		fontWeight: 'bold',
		color: '#fff',
	},
	subtitle: {
		color: '#fff',
		fontSize: 14,
		fontFamily: 'Montserrat',
		lineHeight: 18,
		marginBottom: 24,
	},
	inputWrapper: {
		position: 'relative',
		marginBottom: 12,
	},
	input: {
		width: '100%',
	},
	eyeButton: {
		position: 'absolute',
		right: 12,
		top: 18,
	},
})
