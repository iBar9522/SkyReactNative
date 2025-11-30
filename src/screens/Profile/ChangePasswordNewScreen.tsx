import React from 'react'
import {
	View,
	Text,
	StyleSheet,
	KeyboardAvoidingView,
	TouchableWithoutFeedback,
	Keyboard,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useForm, Controller } from 'react-hook-form'
import Toast from 'react-native-toast-message'

import FormInput from '@/components/FormInput'
import PrimaryButton from '@/components/PrimaryButton'
import { useChangePasswordMutation } from '@/api/profileApi'
import { AppNavigatorkParamList } from '@/navigation/types'

type FormData = {
	newPassword: string
	confirmPassword: string
}

export default function ChangePasswordNewScreen() {
	const navigation =
		useNavigation<NativeStackNavigationProp<AppNavigatorkParamList>>()
	const route =
		useRoute<RouteProp<AppNavigatorkParamList, 'ChangePasswordNew'>>()
	const { oldPassword } = route.params

	const {
		control,
		handleSubmit,
		getValues,
		formState: { errors },
	} = useForm<FormData>({
		defaultValues: {
			newPassword: '',
			confirmPassword: '',
		},
	})

	const [changePassword, { isLoading }] = useChangePasswordMutation()

	const onSubmit = async (data: FormData) => {
		try {
			await changePassword({
				oldPassword,
				newPassword: data.newPassword,
			}).unwrap()

			Toast.show({ type: 'success', text1: 'Пароль успешно изменён' })
			navigation.navigate('Profile')
		} catch (error) {
			console.error('Ошибка при смене пароля', error)
		}
	}

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<KeyboardAvoidingView style={{ flex: 1 }}>
				<LinearGradient
					colors={['#091F44', '#3376F6']}
					style={StyleSheet.absoluteFill}
					start={{ x: 0, y: 0 }}
					end={{ x: 0, y: 1 }}
				/>
				<View style={styles.overlay} />

				<View style={styles.inner}>
					<View style={styles.headerWrapper}>
						<Icon
							name='arrow-back'
							size={24}
							color='#fff'
							onPress={() => navigation.goBack()}
						/>
						<Text style={styles.title}>Смена пароля</Text>
						<View style={{ width: 24 }} />
					</View>

					<View style={styles.content}>
						<Text style={styles.subtitle}>Придумайте новый пароль</Text>

						<Controller
							control={control}
							name='newPassword'
							rules={{
								required: 'Введите новый пароль',
								minLength: {
									value: 8,
									message: 'Минимум 8 символов',
								},
								pattern: {
									value:
										/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
									message:
										'Пароль должен содержать заглавную, строчную букву, цифру и спецсимвол',
								},
							}}
							render={({ field: { onChange, onBlur, value } }) => (
								<FormInput
									placeholder='Новый пароль'
									secureTextEntry
									onChangeText={onChange}
									onBlur={onBlur}
									value={value}
									error={errors.newPassword?.message}
								/>
							)}
						/>

						<Controller
							control={control}
							name='confirmPassword'
							rules={{
								required: 'Подтвердите пароль',
								validate: value =>
									value === getValues('newPassword') || 'Пароли не совпадают',
							}}
							render={({ field: { onChange, onBlur, value } }) => (
								<FormInput
									placeholder='Повторите новый пароль'
									secureTextEntry
									onChangeText={onChange}
									onBlur={onBlur}
									value={value}
									error={errors.confirmPassword?.message}
								/>
							)}
						/>
					</View>

					<PrimaryButton
						title={isLoading ? 'Сохраняем...' : 'Сохранить'}
						style={styles.button}
						onPress={handleSubmit(onSubmit)}
					/>
				</View>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.15)',
	},
	inner: {
		flex: 1,
		padding: 24,
		justifyContent: 'space-between',
	},
	headerWrapper: {
		marginTop: 50,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	title: {
		color: '#fff',
		fontSize: 16,
		fontFamily: 'Montserrat',
		fontWeight: 'bold',
	},
	subtitle: {
		color: '#fff',
		fontFamily: 'Montserrat',
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 24,
		textAlign: 'center',
	},
	content: {
		flexGrow: 1,
		justifyContent: 'center',
	},
	button: {
		marginBottom: 12,
	},
})
