import React, { useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	SafeAreaView,
	ScrollView,
	ActivityIndicator,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import SuccessScreen from '@/components/SuccessScreen'
import Toast from 'react-native-toast-message'
import DocumentPicker from 'react-native-document-picker'
import { useUploadQualificationFileMutation } from '@/api/qualification'

const CRITERIA_LIST = [
	'Высшее образование (экономика, финансы, математика, IT)',
	'Международные сертификаты (CFA, CIIA, FRM и др.)',
	'Опыт работы от 3-х лет в сфере инвестиций или управления рисками',
	'Финансовые активы свыше 8 500 МРП',
	'Опыт 50+ сделок на бирже за последние 12 месяцев',
]

const QualificationUpload = () => {
	const navigation = useNavigation<any>()
	const [files, setFiles] = useState<
		{ name: string; size: string; uploaded: boolean }[]
	>([])
	const [showSuccess, setShowSuccess] = useState(false)
	const [uploadFile, { isLoading }] = useUploadQualificationFileMutation()

	const handleBack = () => navigation.goBack()

	const handleAddFile = async () => {
		try {
			const res = await DocumentPicker.pickSingle({
				type: [DocumentPicker.types.allFiles],
			})

			const fileSizeMB = (res.size || 0) / 1024 / 1024
			const formattedSize = `${fileSizeMB.toFixed(1)} MB`

			const formData = new FormData()
			formData.append('file', {
				uri: res.uri,
				type: res.type,
				name: res.name,
			} as any)

			await uploadFile(formData).unwrap()

			setFiles(prev => [
				...prev,
				{
					name: res.name ?? 'filename',
					size: formattedSize,
					uploaded: true,
				},
			])

			Toast.show({
				type: 'success',
				text1: 'Файл успешно загружен',
			})
		} catch (error: any) {
			if (!DocumentPicker.isCancel(error)) {
				Toast.show({
					type: 'error',
					text1: 'Ошибка загрузки файла',
					text2: error?.data?.message || 'Попробуйте позже',
				})
			}
		}
	}

	const handleDeleteFile = (name: string) => {
		setFiles(prev => prev.filter(f => f.name !== name))
	}

	const handleConfirm = () => {
		if (!files.length) {
			Toast.show({ type: 'info', text1: 'Сначала загрузите документ' })
			return
		}
		setShowSuccess(true)
	}

	if (showSuccess) {
		return (
			<SuccessScreen
				title='Спасибо!'
				subtitle='Как только мы проверим все документы, мы сообщим вам о статусе изменения вашей квалификации'
				buttonText='Вернуться в профиль'
				onPress={() => navigation.navigate('Profile')}
			/>
		)
	}

	return (
		<LinearGradient
			colors={['rgb(51, 118, 246)', 'rgb(9, 32, 68)', 'rgb(0, 0, 0)']}
			style={styles.container}
		>
			<SafeAreaView style={{ flex: 1 }}>
				<View style={styles.header}>
					<TouchableOpacity onPress={handleBack} style={styles.backButton}>
						<Icon name='arrow-back' size={24} color='#fff' />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Квалификация</Text>
				</View>

				<ScrollView
					style={styles.scroll}
					contentContainerStyle={{ paddingBottom: 40 }}
					showsVerticalScrollIndicator={false}
				>
					<Text style={styles.title}>Загрузите документ</Text>

					{files.map((file, index) => (
						<View key={index} style={styles.fileCard}>
							<View style={styles.fileInfo}>
								<Icon
									name='document-outline'
									size={28}
									color='rgba(255,255,255,0.9)'
								/>
								<View style={{ flex: 1, marginLeft: 12 }}>
									<Text style={styles.fileName}>Название документа</Text>
									<Text style={styles.fileDetails}>
										{file.name} • {file.size}
									</Text>
								</View>

								{file.uploaded && (
									<View style={styles.checkIconWrapper}>
										<Icon name='checkmark' size={20} color='#fff' />
									</View>
								)}
							</View>

							<TouchableOpacity
								onPress={() => handleDeleteFile(file.name)}
								style={styles.deleteButton}
							>
								<Text style={styles.deleteText}>Удалить</Text>
							</TouchableOpacity>
						</View>
					))}

					<TouchableOpacity
						style={styles.addButton}
						onPress={handleAddFile}
						disabled={isLoading}
					>
						{isLoading ? (
							<ActivityIndicator color='#fff' />
						) : (
							<Text style={styles.addButtonText}>
								{files.length ? 'Загрузить ещё' : 'Загрузить документ'}
							</Text>
						)}
					</TouchableOpacity>

					<View style={styles.list}>
						{CRITERIA_LIST.map((item, index) => (
							<Text key={index} style={styles.listItem}>
								• {item}
							</Text>
						))}
					</View>
				</ScrollView>

				<View style={styles.footer}>
					<TouchableOpacity
						style={[styles.confirmButton, !files.length && { opacity: 0.6 }]}
						onPress={handleConfirm}
						disabled={!files.length}
					>
						<Text style={styles.confirmText}>Подтвердить квалификацию</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</LinearGradient>
	)
}

export default QualificationUpload

const styles = StyleSheet.create({
	container: { flex: 1 },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 16,
		gap: 80,
	},
	backButton: { padding: 4 },
	headerTitle: {
		color: '#fff',
		fontSize: 18,
		fontFamily: 'Montserrat',
		fontWeight: '600',
	},
	scroll: { paddingHorizontal: 20 },
	title: {
		color: '#fff',
		fontSize: 22,
		fontFamily: 'Montserrat',
		fontWeight: '700',
		marginBottom: 16,
	},
	fileCard: {
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderRadius: 12,
		padding: 12,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.15)',
	},
	fileInfo: { flexDirection: 'row', alignItems: 'center' },
	fileName: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		fontFamily: 'Montserrat',
	},
	fileDetails: {
		color: 'rgba(255,255,255,0.6)',
		fontSize: 12,
		fontFamily: 'Montserrat',
		marginTop: 4,
	},
	checkIconWrapper: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: '#3ED598',
		justifyContent: 'center',
		alignItems: 'center',
	},
	deleteButton: {
		alignSelf: 'flex-end',
		marginTop: 10,
	},
	deleteText: {
		color: '#F66',
		fontSize: 13,
		fontWeight: '600',
		fontFamily: 'Montserrat',
		textDecorationLine: 'underline',
	},
	addButton: {
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.4)',
		borderRadius: 12,
		paddingVertical: 14,
		alignItems: 'center',
		marginTop: 12,
		marginBottom: 28,
	},
	addButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		fontFamily: 'Montserrat',
	},
	list: { marginBottom: 24 },
	listItem: {
		color: '#fff',
		fontSize: 14,
		fontFamily: 'Montserrat',
		lineHeight: 24,
	},
	footer: { padding: 20 },
	confirmButton: {
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
	},
	confirmText: {
		color: '#092044',
		fontSize: 16,
		fontFamily: 'Montserrat',
		fontWeight: '600',
	},
})
