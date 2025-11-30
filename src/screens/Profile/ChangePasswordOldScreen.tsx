import React from 'react'
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Keyboard,
	KeyboardAvoidingView,
	TouchableWithoutFeedback,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useForm, Controller } from 'react-hook-form'
import FormInput from '@/components/FormInput'
import PrimaryButton from '@/components/PrimaryButton'
import { AppNavigatorkParamList } from '@/navigation/types'

export default function ChangePasswordOldScreen() {
	const navigation =
		useNavigation<NativeStackNavigationProp<AppNavigatorkParamList>>()

	const {
		control,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<{ oldPassword: string }>()

	const onSubmit = (data: { oldPassword: string }) => {
		navigation.navigate('ChangePasswordNew', { oldPassword: data.oldPassword })
	}

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<KeyboardAvoidingView style={{ flex: 1 }}>
				<View style={styles.container}>
					<LinearGradient
						colors={['#091F44', '#3376F6']}
						style={StyleSheet.absoluteFill}
						start={{ x: 0, y: 0 }}
						end={{ x: 0, y: 1 }}
					/>
					<View style={styles.overlay} />

					<View style={styles.inner}>
						<View style={styles.headerWrapper}>
							<TouchableOpacity onPress={() => navigation.goBack()}>
								<Icon name='arrow-back' size={24} color='#fff' />
							</TouchableOpacity>
							<Text style={styles.title}>Смена пароля</Text>
							<View style={{ width: 24 }} />
						</View>

						<View style={styles.content}>
							<Text style={styles.subtitle}>
								Введите текущий пароль чтобы продолжить
							</Text>

							<Controller
								control={control}
								name='oldPassword'
								rules={{ required: 'Введите текущий пароль' }}
								render={({ field: { onChange, onBlur, value } }) => (
									<FormInput
										placeholder='Старый пароль'
										secureTextEntry
										onChangeText={onChange}
										onBlur={onBlur}
										value={value}
										error={errors.oldPassword?.message}
									/>
								)}
							/>
						</View>

						<PrimaryButton
							title='Продолжить'
							style={styles.button}
							onPress={handleSubmit(onSubmit)}
						/>
					</View>
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
		marginTop: 38,
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
		fontSize: 22,
		fontFamily: 'Montserrat',
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
