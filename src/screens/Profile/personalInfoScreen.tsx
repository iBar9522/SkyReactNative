import React from 'react'
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Image,
	TouchableOpacity,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'
import FormInput from '@/components/FormInput'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import {
	useUpdateUserProfileMutation,
	useUploadProfileImageMutation,
} from '@/api/profileApi'
import { Controller, useForm } from 'react-hook-form'
import Toast from 'react-native-toast-message'
import { useAuth } from '@/contexts/AuthContext'
import { launchImageLibrary } from 'react-native-image-picker'
import { formatDate } from 'date-fns'

export default function EditPersonalInfoScreen() {
	const navigation = useNavigation<NativeStackNavigationProp<any>>()
	const API_HOST_IMAGE = 'http://82.200.247.197:9000'

	const { user, refetchUser } = useAuth()
	const [updateUserProfile] = useUpdateUserProfileMutation()
	const [uploadProfileImage, { isLoading: isUploading }] =
		useUploadProfileImageMutation()

	const {
		control,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm({
		defaultValues: {
			email: user?.email || '',
			phone: user?.phone || '',
			firstName: user?.firstName || '',
			lastName: user?.lastName || '',
		},
	})

	const onSubmit = async (values: any) => {
		try {
			await updateUserProfile(values).unwrap()
			await refetchUser()
			Toast.show({ type: 'success', text1: 'Профиль успешно обновлён' })
			navigation.goBack()
		} catch (error) {
			console.log('Ошибка при обновлении профиля:', error)
		}
	}

	const handleUploadAvatar = async () => {
		launchImageLibrary(
			{
				mediaType: 'photo',
				includeBase64: false,
				selectionLimit: 1,
			},
			async response => {
				if (response.didCancel) return
				if (response.errorCode) {
					Toast.show({
						type: 'error',
						text1: 'Ошибка',
						text2: response.errorMessage,
					})
					return
				}

				const asset = response.assets?.[0]
				if (!asset?.uri) return

				const fileSizeMB = asset.fileSize ? asset.fileSize / (1024 * 1024) : 0
				if (fileSizeMB > 5) {
					Toast.show({
						type: 'error',
						text1: 'Ошибка',
						text2: 'Размер файла не должен превышать 5 МБ',
					})
					return
				}

				const formData = new FormData()
				formData.append('file', {
					uri: asset.uri,
					name: asset.fileName || 'profile.jpg',
					type: asset.type || 'image/jpeg',
				} as any)

				try {
					await uploadProfileImage(formData).unwrap()
					await refetchUser()
					Toast.show({
						type: 'success',
						text1: 'Фото профиля обновлено',
					})
				} catch (error) {
					console.log('Ошибка при загрузке фото профиля:', error)
				}
			}
		)
	}

	const getInitials = (firstName?: string, lastName?: string) => {
		const first = firstName?.[0]?.toUpperCase() ?? ''
		const last = lastName?.[0]?.toUpperCase() ?? ''
		return `${first}${last}`
	}

	if (!user) {
		return (
			<View
				style={[
					styles.container,
					{ justifyContent: 'center', alignItems: 'center' },
				]}
			>
				<ActivityIndicator size='large' color='#fff' />
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#091F44', '#3376F6']}
				style={StyleSheet.absoluteFill}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
			/>
			<View style={styles.overlay} />

			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
			>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => navigation.goBack()}>
						<Icon name='arrow-back' size={24} color='#fff' />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Личные данные</Text>
					<View style={{ width: 24 }} />
				</View>
				<ScrollView contentContainerStyle={styles.scroll}>
					<View style={styles.avatarWrapper}>
						{user?.profileImageUrl ? (
							<Image
								source={{ uri: `${API_HOST_IMAGE}${user.profileImageUrl}` }}
								style={styles.avatar}
							/>
						) : (
							<View style={styles.initialsAvatar}>
								<Text style={styles.initialsText}>
									{getInitials(user?.firstName, user?.lastName)}
								</Text>
							</View>
						)}
						<TouchableOpacity
							style={styles.uploadButton}
							onPress={handleUploadAvatar}
							disabled={isUploading}
						>
							{isUploading ? (
								<ActivityIndicator color='#fff' size='small' />
							) : (
								<Icon name='camera' color='#fff' size={18} />
							)}
						</TouchableOpacity>
					</View>

					<Text style={styles.name}>
						{user?.firstName} {user?.lastName}
					</Text>
					<Text style={styles.phone}>{user?.phone}</Text>

					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Данные из документа</Text>

						<Controller
							control={control}
							name='firstName'
							render={({ field: { value, onChange } }) => (
								<FormInput
									value={value}
									onChangeText={onChange}
									label='Имя'
									placeholder='Имя'
									disabled
								/>
							)}
						/>

						<Controller
							control={control}
							name='lastName'
							render={({ field: { value, onChange } }) => (
								<FormInput
									value={value}
									onChangeText={onChange}
									label='Фамилия'
									placeholder='Фамилия'
									disabled
								/>
							)}
						/>

						<FormInput defaultValue='Казахстан' label='Гражданство' disabled />
						<FormInput
							defaultValue={formatDate(user?.birthdate, 'dd-MM-yyyy')}
							label='Дата рождения'
							disabled
						/>
						<FormInput defaultValue={user?.iin} label='ИИН' disabled />
					</View>

					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Контакты</Text>

						<Controller
							control={control}
							name='email'
							rules={{
								required: 'Введите email',
								pattern: {
									value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
									message: 'Неверный формат email',
								},
							}}
							render={({
								field: { value, onChange },
								fieldState: { error },
							}) => (
								<FormInput
									value={value}
									onChangeText={onChange}
									label='Email'
									placeholder='Email'
									error={error?.message}
								/>
							)}
						/>

						<Controller
							control={control}
							name='phone'
							rules={{
								required: 'Введите номер телефона',
								validate: (v: string) => {
									const digits = (v || '').replace(/\D/g, '')
									return digits.length === 11 && digits[0] === '7'
										? true
										: 'Введите номер в формате +7XXXXXXXXXX'
								},
							}}
							render={({
								field: { value, onChange },
								fieldState: { error },
							}) => (
								<FormInput
									value={value}
									onChangeText={onChange}
									label='Телефон'
									placeholder='Номер телефона'
									error={error?.message}
									maxLength={12}
								/>
							)}
						/>

						<TouchableOpacity
							style={styles.updateButton}
							onPress={handleSubmit(onSubmit)}
						>
							{/* <Icon
							name='arrow-up-circle-outline'
							size={18}
							color='#000'
							style={{ marginRight: 6 }}
						/> */}
							<Text style={styles.updateButtonText}>Сохранить</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.15)',
	},
	scroll: {
		padding: 12,
		paddingBottom: 40,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 50,
		position: 'static',
		top: 0,
		left: 0,
		right: 0,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	headerTitle: {
		color: '#fff',
		fontSize: 16,
		fontFamily: 'Montserrat',
		fontWeight: '600',
	},
	avatarWrapper: {
		alignSelf: 'center',
		marginBottom: 12,
	},
	avatar: {
		width: 96,
		height: 96,
		borderRadius: 48,
	},
	initialsAvatar: {
		width: 96,
		height: 96,
		borderRadius: 48,
		backgroundColor: '#1C3F77',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.15)',
	},
	initialsText: {
		color: '#fff',
		fontSize: 32,
		fontWeight: '700',
		fontFamily: 'Montserrat',
	},
	uploadButton: {
		position: 'absolute',
		right: 0,
		bottom: 0,
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: '#3376F6',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: '#fff',
	},
	name: {
		textAlign: 'center',
		color: '#fff',
		fontSize: 18,
		fontFamily: 'Montserrat',
		fontWeight: '600',
		marginBottom: 4,
	},
	phone: {
		textAlign: 'center',
		color: '#ccc',
		fontSize: 14,
		fontFamily: 'Montserrat',
		marginBottom: 24,
	},
	section: {
		marginBottom: 32,
		borderRadius: 15,
		backgroundColor: 'rgba(77, 77, 77, 0.1)',
		paddingTop: 20,
		paddingHorizontal: 12,
	},
	sectionTitle: {
		color: '#fff',
		fontSize: 16,
		fontFamily: 'Montserrat',
		fontWeight: '500',
		marginBottom: 12,
	},
	updateButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 30,
		paddingVertical: 14,
		justifyContent: 'center',
		marginTop: 16,
	},
	updateButtonText: {
		color: '#00244D',
		fontWeight: 'bold',
		fontSize: 16,
		fontFamily: 'Montserrat',
	},
})
