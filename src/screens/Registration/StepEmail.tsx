import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Controller, UseFormReturn } from 'react-hook-form'
import FormInput from '../../components/FormInput'
import PrimaryButton from '../../components/PrimaryButton'
import { RegistrationFormValues } from '@/types/AuthTypes'
import Toast from 'react-native-toast-message'
import { useSendEmailCodeMutation } from '@/api/notificationsApi'

interface Props {
	form: UseFormReturn<RegistrationFormValues>
	onNext: () => void
	onBack: () => void
}

const StepEmail: React.FC<Props> = ({ form, onNext }) => {
	const { control, handleSubmit } = form
	const [sendEmailCode] = useSendEmailCodeMutation()

	const [cooldown, setCooldown] = useState(0)
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		let timer: NodeJS.Timeout
		if (cooldown > 0) {
			timer = setTimeout(() => setCooldown(prev => prev - 1), 1000)
		}
		return () => clearTimeout(timer)
	}, [cooldown])

	const onSubmit = async (data: RegistrationFormValues) => {
		if (cooldown > 0 || isSubmitting) return

		setIsSubmitting(true)
		setCooldown(7)

    try {
        await sendEmailCode({ email: data.email.toLowerCase() }).unwrap()
        Toast.show({ type: 'success', text1: 'Код отправлен на почту' })

        // Показать текст и подержать экран 2 секунды, затем перейти дальше
        setTimeout(() => {
            onNext()
        }, 2000)
    } catch (err) {
			console.warn(err)
			setCooldown(0)
			Toast.show({ type: 'error', text1: 'Ошибка отправки кода' })
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<View style={styles.container}>
			<View>
				<Text style={styles.title}>Укажите свою электронную почту</Text>
				<Text style={styles.subtitle}>
					Укажите свою электронную почту для получения писем и отчетов
				</Text>

				<View style={{ marginTop: 20 }}>
					<Controller
						control={control}
						name='email'
						rules={{
							required: 'Введите email',
							pattern: {
								value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
								message: 'Некорректный email',
							},
						}}
						render={({ field: { onChange, value }, fieldState: { error } }) => (
							<FormInput
								placeholder='example@gmail.com'
								value={value}
								onChangeText={onChange}
								keyboardType='email-address'
								error={error?.message}
							/>
						)}
					/>
				</View>
			</View>

            {cooldown > 0 ? (
                <Text style={styles.cooldownText}>
                    Можно повторить через {cooldown} c
                </Text>
            ) : (
                <PrimaryButton
                    title={isSubmitting ? 'Отправка...' : 'Продолжить'}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                />
            )}
		</View>
	)
}

export default StepEmail

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 36,
		justifyContent: 'space-between',
	},
	title: {
		fontFamily: 'Montserrat',
		fontSize: 23,
		fontWeight: '700',
		color: '#fff',
		textAlign: 'left',
		marginBottom: 20,
	},
	subtitle: {
		fontSize: 14,
		fontFamily: 'Montserrat',
		fontWeight: 400,
		color: '#fff',
		textAlign: 'left',
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
