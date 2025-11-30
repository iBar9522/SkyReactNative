import React, { useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	KeyboardAvoidingView,
	TouchableWithoutFeedback,
	Keyboard,
	Platform,
	TouchableOpacity,
	Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import LinearGradient from 'react-native-linear-gradient'
import { CustomDateTimePicker } from '@/components/DateTimePicker'
import PrimaryButton from '@/components/PrimaryButton'
import Icon from 'react-native-vector-icons/Ionicons'
import { useAuth } from '@/contexts/AuthContext'
import { useLazyGetReportsDateQuery } from '@/api/reportApi'
import RNFS from 'react-native-fs'
import RNFetchBlob from 'react-native-blob-util'
import Toast from 'react-native-toast-message'
const ReportsDate = () => {
	const [date, setDate] = useState('')
	const navigation = useNavigation<any>()
	const { user } = useAuth()
	const [triggerGetReportsDate] = useLazyGetReportsDateQuery()

	const handleGenerateReport = async () => {
		if (!date.trim()) {
			Toast.show({
				type: 'error',
				text1: 'Введите дату',
			})
			return
		}

		try {
			const parts = date.split('/')

			if (parts.length !== 3) {
				Toast.show({
					type: 'error',
					text1: 'Неверный формат даты',
				})
				return
			}

			const [day, month, year] = parts

			const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(
				2,
				'0'
			)}`

			const apiResult = await triggerGetReportsDate({
				userId: user?.oracleClientId,
				OnDate: formattedDate,
			}).unwrap()

			if (apiResult?.base64) {
				const fileName = `report-order-${Date.now()}.pdf`

				const dirs = RNFetchBlob.fs.dirs
				const baseDir =
					Platform.OS === 'android'
						? dirs.DownloadDir || dirs.SDCardDir
						: dirs.DocumentDir

				const filePath = `${baseDir}/${fileName}`

				await RNFS.writeFile(filePath, apiResult.base64, 'base64')

				if (Platform.OS === 'ios') {
					RNFetchBlob.ios.openDocument(filePath)
				} else {
					RNFetchBlob.android.actionViewIntent(
						filePath,
						apiResult.contentType || 'application/pdf'
					)
				}

				Toast.show({
					type: 'success',
					text1: 'Отчет готов',
					text2: 'Открываем документ',
				})
			} else {
				Toast.show({
					type: 'error',
					text1: 'Файл не получен',
				})
			}
		} catch (error) {
			console.error('Download error:', error)
			Toast.show({
				type: 'error',
				text1: 'Ошибка скачивания',
				text2: 'Попробуйте ещё раз',
			})
		}
	}

	return (
		<LinearGradient
			colors={['#091F44', '#3376F6']}
			start={{ x: 0, y: 0 }}
			end={{ x: 0, y: 1 }}
			style={StyleSheet.absoluteFill}
		>
			<SafeAreaView style={styles.safeArea}>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<KeyboardAvoidingView
						style={styles.content}
						behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					>
						<View style={styles.header}>
							<TouchableOpacity
								style={styles.backButton}
								onPress={() => navigation.goBack()}
							>
								<Icon name='arrow-back' size={24} color='#fff' />
							</TouchableOpacity>
							<Text style={styles.headerTitle}>Выписка на дату</Text>
						</View>

						<View style={styles.mainContent}>
							<CustomDateTimePicker
								value={date}
								onChange={setDate}
								placeholder='дд/мм/гггг'
								label='Введите дату выписки'
							/>
						</View>

						<View style={styles.buttonContainer}>
							<PrimaryButton
								title='Сформировать выписку'
								onPress={handleGenerateReport}
							/>
						</View>
					</KeyboardAvoidingView>
				</TouchableWithoutFeedback>
			</SafeAreaView>
		</LinearGradient>
	)
}

export default ReportsDate

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: 'space-between',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		marginTop: 20,
		marginBottom: 40,
	},
	backButton: {
		padding: 8,
		marginRight: 16,
	},
	leftArrowIcon: {
		width: 24,
		height: 24,
		tintColor: 'white',
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: '600',
		color: 'white',
		fontFamily: 'Montserrat',
	},
	mainContent: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	buttonContainer: {
		paddingHorizontal: 20,
		paddingBottom: 40,
	},
})
