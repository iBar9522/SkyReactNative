import React, { useEffect, useRef, useState } from 'react'
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native'
import { UseFormReturn } from 'react-hook-form'
import {
	useSendEmailCodeMutation,
	useVerifyCodeMutation,
} from '@/api/notificationsApi'
import Toast from 'react-native-toast-message'
import { RegistrationFormValues } from '@/types/AuthTypes'

const RESEND_INTERVAL = 60

type Props = {
	form: UseFormReturn<RegistrationFormValues>
	onNext: () => void
	onBack: () => void
}

const StepConfirmEmail: React.FC<Props> = ({ form, onNext }) => {
	const [verifyCode] = useVerifyCodeMutation()
	const [sendEmailCode] = useSendEmailCodeMutation()

	const [code, setCode] = useState('')
	const [timer, setTimer] = useState(RESEND_INTERVAL)
	const [isVerifying, setIsVerifying] = useState(false)

	const inputRef = useRef<TextInput>(null)

	useEffect(() => {
		if (code.length === 6) {
			handleComplete()
		}
	}, [code])

	useEffect(() => {
		if (timer <= 0) return
		const interval = setInterval(() => setTimer(t => t - 1), 1000)
		return () => clearInterval(interval)
	}, [timer])

	const handleComplete = async () => {
		if (isVerifying || code.length !== 6) return
		setIsVerifying(true)
		try {
			await verifyCode({
				code,
				target: form.getValues('email').toLowerCase(),
			}).unwrap()
			Toast.show({ type: 'success', text1: 'Email подтвержден' })
			onNext()
		} catch (err) {
			console.warn(err)
		} finally {
			setIsVerifying(false)
		}
	}

	const resendEmail = async () => {
		try {
			await sendEmailCode({ email: form.getValues('email') }).unwrap()
			Toast.show({ type: 'success', text1: 'Код отправлен на почту' })
			setTimer(RESEND_INTERVAL)
		} catch (err) {
			console.warn(err)
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Подтвердите свой почтовый адрес</Text>
			<Text style={styles.subtitle}>
				Введите 6-ти значный код, который мы отправили на указанную вами почту
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

			<Text style={styles.resendText}>
				Не получили код?{'  '}
				{timer > 0 ? (
					<Text style={styles.resendLink}>
						Отправить снова через 0:{timer.toString().padStart(2, '0')}
					</Text>
				) : (
					<Pressable onPress={resendEmail}>
						<Text style={styles.resendLink}>Отправить снова</Text>
					</Pressable>
				)}
			</Text>
		</View>
	)
}

export default StepConfirmEmail

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
		justifyContent: 'center',
	},
	title: {
		fontFamily: 'Montserrat',
		fontSize: 23,
		fontWeight: '700',
		color: '#fff',
		textAlign: 'center',
		marginBottom: 12,
	},
	subtitle: {
		fontFamily: 'Montserrat',
		fontSize: 12,
		fontWeight: '400',
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
	resendText: {
		textAlign: 'center',
		marginTop: 12,
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
