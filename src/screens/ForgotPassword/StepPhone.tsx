import { useSendSmsCodeMutation } from '@/api/notificationsApi'
import PhoneInputWithCountry from '@/components/PhoneInputWithCountry'
import { useNavigation } from '@react-navigation/native'
import React, { useState, useEffect, useRef } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import PrimaryButton from '../../components/PrimaryButton'
import { ForgotPasswordForm } from './index'
import Icon from 'react-native-vector-icons/Ionicons'
import Toast from 'react-native-toast-message'

type Props = {
	form: UseFormReturn<ForgotPasswordForm>
	onNext: () => void
}

const StepPhone: React.FC<Props> = ({ form, onNext }) => {
	const { control, handleSubmit } = form
	const navigation = useNavigation()
	const [sendSmsCode] = useSendSmsCodeMutation()
	const hasNavigatedRef = useRef(false)
	const [cooldown, setCooldown] = useState(0)
	const [isSending, setIsSending] = useState(false)

	useEffect(() => {
		let timer: NodeJS.Timeout
		if (cooldown > 0) {
			timer = setTimeout(() => setCooldown(prev => prev - 1), 1000)
		}
		return () => clearTimeout(timer)
	}, [cooldown])

	const onSubmit = async (values: ForgotPasswordForm) => {
		if (cooldown > 0 || isSending || hasNavigatedRef.current) return

		setIsSending(true)
		setCooldown(7)

		try {
			await sendSmsCode({ phone: values.phone }).unwrap()
			Toast.show({ type: 'success', text1: 'Код отправлен' })

			setTimeout(() => {
				if (!hasNavigatedRef.current) {
					hasNavigatedRef.current = true
					onNext()
				}
			}, 1000)
		} catch (error: any) {
			console.warn('Ошибка при отправке SMS:', error)
			setCooldown(0)
			Toast.show({ type: 'error', text1: 'Ошибка отправки кода' })
		} finally {
			setIsSending(false)
		}
	}

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
				>
					<Icon name='arrow-back' size={24} color='#fff' />
				</TouchableOpacity>

				<Text style={styles.title}>Восстановление пароля</Text>
				<Text style={styles.subtitle}>
					Введите номер телефона, на который зарегистрирован Ваш аккаунт
				</Text>

				<PhoneInputWithCountry name='phone' control={control} />
			</View>

			<View style={styles.bottomContainer}>
				{cooldown > 0 ? (
					<Text style={styles.cooldownText}>
						Можно повторить через {cooldown} c
					</Text>
				) : (
					<PrimaryButton
						title={'Продолжить'}
						onPress={handleSubmit(onSubmit)}
						disabled={isSending}
					/>
				)}
			</View>
		</View>
	)
}

export default StepPhone

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 60,
		justifyContent: 'space-between',
	},
	content: {
		flexShrink: 1,
	},
	backButton: {
		marginBottom: 16,
	},
	title: {
		fontSize: 22,
		fontFamily: 'Montserrat',
		fontWeight: '700',
		color: '#fff',
		marginTop: 36,
		marginBottom: 12,
	},
	subtitle: {
		color: 'rgba(255,255,255,0.9)',
		fontSize: 14,
		fontFamily: 'Montserrat',
		lineHeight: 20,
		marginBottom: 32,
	},
	bottomContainer: {
		marginBottom: 40,
	},
	cooldownText: {
		color: '#fff',
		fontSize: 16,
		fontFamily: 'Montserrat',
		textAlign: 'center',
		paddingVertical: 16,
		opacity: 0.9,
	},
})
