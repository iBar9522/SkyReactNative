import {
	useGetTopUpMethodByIdQuery,
	useGetTopUpMethodsQuery,
} from '@/api/utilsApi'
import Button from '@/components/Button'
import { AppNavigatorkParamList } from '@/navigation/types'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React from 'react'
import {
	Image,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'
import Toast from 'react-native-toast-message'
import RNFetchBlob from 'react-native-blob-util'

type NavigationProp = NativeStackNavigationProp<
	AppNavigatorkParamList,
	'FundAccount'
>

export default function FundAccountScreen() {
	const navigation = useNavigation<NavigationProp>()
	const { data: methods, isLoading } = useGetTopUpMethodsQuery(undefined, {
		refetchOnMountOrArgChange: true,
	})

	const firstMethodId = methods?.[0]?.id
	const { data: firstMethodData } = useGetTopUpMethodByIdQuery(firstMethodId!, {
		skip: !firstMethodId,
	})

	const handleDownload = async () => {
		try {
			if (!firstMethodData?.file_path) {
				Toast.show({
					type: 'error',
					text1: 'Файл не найден',
					text2: 'Документ недоступен для загрузки',
				})
				return
			}

			const url = `http://82.200.247.197:3030${firstMethodData.file_path}`
			const nameFromUrl = decodeURIComponent(
				(url.split('?')[0] || '').split('/').pop() || ''
			)
			const filename = nameFromUrl || `requisites_${Date.now()}.pdf`

			if (Platform.OS === 'android') {
				const { DownloadDir } = RNFetchBlob.fs.dirs
				const destPath = `${DownloadDir}/${filename}`

				await RNFetchBlob.config({
					addAndroidDownloads: {
						useDownloadManager: true,
						notification: true,
						title: filename,
						description: 'Загрузка реквизитов',
						mediaScannable: true,
						path: destPath,
					},
				}).fetch('GET', url)

				Toast.show({
					type: 'success',
					text1: 'Файл загружен',
					text2: `Сохранен в Загрузки\n${destPath}`,
				})
			} else {
				const path = `${RNFetchBlob.fs.dirs.DocumentDir}/${filename}`
				const res = await RNFetchBlob.config({ fileCache: true, path }).fetch(
					'GET',
					url
				)
				RNFetchBlob.ios.openDocument(res.path())
			}
		} catch (error) {
			console.log('Ошибка загрузки:', error)
			Toast.show({
				type: 'error',
				text1: 'Ошибка загрузки файла',
				text2: 'Попробуйте позже',
			})
		}
	}

	return (
		<LinearGradient colors={['#091F44', '#3376F6']} style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Icon name='arrow-back' size={24} color='#fff' />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Как пополнить счет</Text>
				<View style={{ width: 24 }} />
			</View>

			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.mainWrapper}>
					<View style={styles.card}>
						<Text style={styles.title}>Уважаемый клиент!</Text>
						<Text style={styles.text}>
							В настощий момент пополнить свой счет Вы можете через банковское
							приложение либо отделение Вашего банка, используя следующие
							реквизиты:
						</Text>
					</View>

					<Text style={styles.subtitle}>Реквизиты:</Text>

					{methods?.map(method => (
						<TouchableOpacity
							key={method.id}
							style={styles.button}
							onPress={() =>
								navigation.navigate('FundAccountDetail', { id: method.id })
							}
						>
							<Text style={styles.buttonText}>{method.title}</Text>
							<Image
								source={require('@/assets/arrow-right.png')}
								style={styles.arrowIcon}
								resizeMode='contain'
							/>
						</TouchableOpacity>
					))}
				</View>

				<Button
					textSize={16}
					style={styles.downloadBtn}
					title='Скачать реквизиты'
					onPress={handleDownload}
				/>
			</ScrollView>
		</LinearGradient>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	content: { paddingHorizontal: 10 },
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		position: 'static',
		marginTop: 50,
		top: 0,
		left: 0,
		right: 0,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	headerTitle: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		fontFamily: 'Montserrat',
	},
	mainWrapper: {
		backgroundColor: 'rgba(255,255,255,0.08)',
		padding: 16,
		borderRadius: 16,
	},
	card: { marginBottom: 24 },
	title: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 8,
		fontFamily: 'Montserrat',
	},
	text: { color: '#ccc', fontSize: 14 },
	subtitle: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '600',
		fontFamily: 'Montserrat',
		marginBottom: 12,
	},
	button: {
		backgroundColor: 'rgba(255,255,255,0.1)',
		padding: 16,
		borderRadius: 12,
		marginBottom: 12,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	buttonText: {
		color: '#fff',
		fontSize: 14,
		fontFamily: 'Montserrat',
	},
	arrowIcon: {
		width: 16,
		height: 16,
		tintColor: '#fff',
	},
	downloadBtn: {
		marginTop: 40,
		flexDirection: 'row',
		gap: 10,
		flex: 1,
		height: 48,
		backgroundColor: '#fff',
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
})
