import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native'
import { UseFormReturn } from 'react-hook-form'
import {
	useSendSmsCodeMutation,
	useVerifyCodeMutation,
} from '@/api/notificationsApi'
import Toast from 'react-native-toast-message'
import { RegistrationFormValues } from '@/types/AuthTypes'

const RESEND_INTERVAL = 60

type Props = {
	form: UseFormReturn<RegistrationFormValues>
	onNext: () => void
	onBack: () => void
	onError?: () => void
}

const StepCode: React.FC<Props> = ({ form, onNext, onError }) => {
	const [code, setCode] = useState('')
	const [timer, setTimer] = useState(RESEND_INTERVAL)
	const [isVerifying, setIsVerifying] = useState(false)
	const intervalRef = useRef<NodeJS.Timeout | null>(null)
	const inputRef = useRef<TextInput>(null)

	const [sendSmsCode] = useSendSmsCodeMutation()
	const [verifyCode] = useVerifyCodeMutation()
	const phone = form.getValues('phone')
	const last4 = phone?.slice(-4) || '****'

	useEffect(() => {
		startTimer()
	}, [])

	useEffect(() => {
		if (timer <= 0 && intervalRef.current) {
			clearInterval(intervalRef.current)
		}
	}, [timer])

	useEffect(() => {
		if (code.length === 6) {
			handleComplete()
		}
	}, [code])

	const startTimer = () => {
		setTimer(RESEND_INTERVAL)
		if (intervalRef.current) clearInterval(intervalRef.current)
		intervalRef.current = setInterval(() => {
			setTimer(prev => prev - 1)
		}, 1000)
	}

	const handleResendSms = async () => {
		try {
			await sendSmsCode({ phone }).unwrap()
			Toast.show({ type: 'success', text1: 'Код отправлен' })
			startTimer()
		} catch (err) {
			console.warn('Ошибка отправки кода', err)
		}
	}

	const handleComplete = async () => {
		if (code.length === 6 && !isVerifying) {
			setIsVerifying(true)
			try {
				await verifyCode({ target: phone, code }).unwrap()
				Toast.show({ type: 'success', text1: 'Код подтвержден' })
				onNext()
			} catch (err) {
				console.warn('Неверный код или ошибка сервера', err)
			} finally {
				setIsVerifying(false)
			}
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Подтвердите свой номер телефона</Text>
			<Text style={styles.subtitle}>
				Введите 6-ти значный код, который мы отправили на указанный вами номер
				телефона, заканчивающийся на {last4}
			</Text>

			<Pressable onPress={() => inputRef.current?.focus()}>
				<View style={styles.codeContainer}>
					{Array.from({ length: 6 }).map((_, i) => (
						<View key={i} style={styles.codeBox}>
							<Text style={styles.codeText}>{code[i] || ''}</Text>
						</View>
					))}
					<TextInput
						style={styles.hiddenInput}
						value={code}
						ref={inputRef}
						onChangeText={text => {
							if (text.length <= 6) setCode(text)
						}}
						keyboardType='number-pad'
						maxLength={6}
						autoFocus
					/>
				</View>
			</Pressable>

			<View style={styles.resendWrapper}>
				<Text style={styles.resendText}>Не получили код?</Text>
				{timer > 0 ? (
					<Text style={styles.resendLink}>
						Отправить снова через 0:{timer.toString().padStart(2, '0')}
					</Text>
				) : (
					<Pressable onPress={handleResendSms}>
						<Text style={[styles.resendLink]}>Отправить снова</Text>
					</Pressable>
				)}
			</View>
		</View>
	)
}

export default StepCode

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
		justifyContent: 'center',
	},
	title: {
		fontFamily: 'Montserrat',
		fontSize: 22,
		fontWeight: '700',
		color: '#fff',
		textAlign: 'center',
		marginBottom: 12,
	},
	subtitle: {
		fontFamily: 'Montserrat',
		fontSize: 12,
		fontWeight: '400',
		letterSpacing: 1,
		color: '#fff',
		textAlign: 'center',
		marginBottom: 32,
	},
	codeContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 24,
		position: 'relative',
	},
	codeBox: {
		width: 40,
		height: 50,
		borderRadius: 8,
		backgroundColor: 'rgba(255,255,255,0.2)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	codeText: {
		fontSize: 20,
		fontFamily: 'Montserrat',
		color: '#fff',
	},
	hiddenInput: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		opacity: 0,
	},
	resendWrapper: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 12,
		gap: 7,
	},
	resendText: {
		fontFamily: 'Montserrat',
		fontSize: 12,
		fontWeight: '500',
		color: 'rgb(91, 142, 200)',
	},
	resendLink: {
		color: 'white',
		fontSize: 12,
		fontFamily: 'Montserrat',
		fontWeight: '500',
		textDecorationLine: 'underline',
	},
})
