import { useVerifyCodeMutation } from '@/api/notificationsApi'
import React, { useEffect, useRef, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import {
	Image,
	Keyboard,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import PrimaryButton from '../../components/PrimaryButton'
import { ForgotPasswordForm } from './index'
import Icon from 'react-native-vector-icons/Ionicons'

type Props = {
	form: UseFormReturn<ForgotPasswordForm>
	onNext: () => void
	onBack: () => void
	setVerifyCode: (code: string) => void
}

const RESEND_INTERVAL = 60

const StepCode: React.FC<Props> = ({ form, onNext, onBack, setVerifyCode }) => {
	const [code, setCode] = useState('')
	const [timer, setTimer] = useState(RESEND_INTERVAL)
	const inputRef = useRef<TextInput>(null)

	const isProceedingRef = useRef(false)
	const { getValues } = form
	const phone = getValues('phone')

	const [verifyCode] = useVerifyCodeMutation()

	useEffect(() => {
		if (timer <= 0) return
		const interval = setInterval(() => setTimer(t => t - 1), 1000)
		return () => clearInterval(interval)
	}, [timer])

	const handleChange = async (text: string) => {
		if (text.length <= 6) {
			setCode(text)
		}
		if (text.length === 6) {
			Keyboard.dismiss()

			if (isProceedingRef.current) return
			isProceedingRef.current = true
			try {
				await verifyCode({ code: text, target: phone, removeAfter:false }).unwrap()
				form.setValue('verifyCode', text)
				setVerifyCode(text)
		    onNext()
			} catch (error: any) {
				console.warn(error)
				
				isProceedingRef.current = false
			}
		}
	}

	return (
		<View style={styles.container}>
			<View style={styles.containerHeader}>
				<TouchableOpacity style={styles.backButton} onPress={onBack}>
					<Icon name='arrow-back' size={24} color='#fff' />
				</TouchableOpacity>
				<Text style={styles.title}>Код подтверждения</Text>
			</View>

			<View>
				<Text style={styles.subtitle}>
					Введите 6-ти значный код, который мы отправили на указанный вами номер
					телефона.
				</Text>

				<TouchableOpacity
					activeOpacity={1}
					onPress={() => inputRef.current?.focus()}
					style={styles.codeContainer}
				>
					{Array.from({ length: 6 }).map((_, i) => (
						<View key={i} style={styles.codeBox}>
							<Text style={styles.codeText}>{code[i] || ''}</Text>
						</View>
					))}
					<TextInput
						ref={inputRef}
						value={code}
						onChangeText={handleChange}
						keyboardType='number-pad'
						maxLength={6}
						style={styles.hiddenInput}
						autoFocus
					/>
				</TouchableOpacity>

				<Text style={styles.resendText}>
					Не получили код?{' '}
					{timer > 0 ? (
						<Text style={styles.resendLink}>
							Отправить снова через 0:{timer.toString().padStart(2, '0')}
						</Text>
					) : (
						<Text
							style={[styles.resendLink]}
							onPress={() => setTimer(RESEND_INTERVAL)}
						>
							Отправить снова
						</Text>
					)}
				</Text>
			</View>

			<PrimaryButton
				title='Продолжить'
				onPress={() => {
					if (code.length === 6) onNext()
				}}
			/>
		</View>
	)
}

export default StepCode

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
		fontSize: 12,
		fontFamily: 'Montserrat',
		marginBottom: 32,
		textAlign: 'center',
	},
	codeContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 24,
		position: 'relative',
	},
	codeBox: {
		width: 48,
		height: 56,
		borderRadius: 10,
		backgroundColor: 'rgba(255,255,255,0.15)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	codeText: {
		fontSize: 22,
		fontFamily: 'Montserrat',
		color: '#fff',
		fontWeight: '600',
	},
	hiddenInput: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		opacity: 0,
	},
	resendText: {
		textAlign: 'center',
		color: '#ccc',
		fontSize: 13,
		fontFamily: 'Montserrat',
	},
	resendLink: {
		color: '#fff',
		textDecorationLine: 'underline',
	},
})
