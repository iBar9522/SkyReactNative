import { useGetTopUpMethodByIdQuery } from '@/api/utilsApi'
import TopUpField from '@/components/TopUpField'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React from 'react'
import {
	ActivityIndicator,
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
import { useGetClientAttributesQuery } from '@/api/legacyAdapterApi'
import { useAuth } from '@/contexts/AuthContext'

export default function FundAccountDetailsScreen() {
	const route = useRoute()
	const navigation = useNavigation<NativeStackNavigationProp<any>>()
	const { id } = route.params as { id: string }
	const { user } = useAuth()

	const { data, isLoading } = useGetTopUpMethodByIdQuery(id)
	const { data: clientData } = useGetClientAttributesQuery(
		user?.oracleClientId,
		{
			skip: !user?.oracleClientId,
		}
	)

	if (isLoading || !data) {
		return (
			<LinearGradient colors={['#091F44', '#3376F6']} style={styles.container}>
				<ActivityIndicator
					size='large'
					color='#fff'
					style={{ marginTop: 50 }}
				/>
			</LinearGradient>
		)
	}

	function getPaymentPurpose(client?: any) {
		if (!client) return ''

		const contractNum = client.CONTRACT_NUMBER || '—'
		const rawDate = client.CONTRACT_DATE || ''
		const account = client.PERSONAL_ACCOUNT || '—'
		const clientName = client.CL_NAME || client.ENG_NAME || '—'

		let formattedDate = '—'
		if (rawDate) {
			const d = new Date(rawDate)
			if (!isNaN(d.getTime())) {
				const day = String(d.getDate()).padStart(2, '0')
				const month = String(d.getMonth() + 1).padStart(2, '0')
				const year = d.getFullYear()
				formattedDate = `${day}.${month}.${year}`
			}
		}

		return `Пополнение лицевого счета №${account} на основании Договора №${contractNum} от ${formattedDate}, получатель – ${clientName}`
	}

	const { title, requisites } = data
	const purposeText = getPaymentPurpose(clientData)

	const fields = [
		requisites?.beneficiary && {
			label: 'Бенефициар',
			value: requisites.beneficiary,
		},
		requisites?.bin && { label: 'БИН', value: requisites.bin },
		requisites?.iban && { label: 'ИИК', value: requisites.iban },
		requisites?.iban_kzt && { label: 'ИИК в KZT', value: requisites.iban_kzt },
		requisites?.iban_usd && {
			label: 'ИИК в USD',
			value: `${requisites.iban_usd} (${requisites.bank_usd}, Swift: ${requisites?.swift_usd})`,
		},
		requisites?.iban_eur && {
			label: 'ИИК в EUR',
			value: `${requisites.iban_eur} (${requisites.bank_eur}, Swift: ${requisites?.swift_eur})`,
		},
		requisites?.iban_gbp && {
			label: 'ИИК в GBP',
			value: `${requisites.iban_gbp} (${requisites.bank_gbp}, Swift: ${requisites?.swift_gbp})`,
		},
		requisites?.bank && {
			label: 'Банк бенефициара',
			value: requisites.bank,
		},
		requisites?.beneficiary_bank && {
			label: 'Банк бенефициара',
			value: requisites.beneficiary_bank,
		},
		requisites?.swift && { label: 'БИК', value: requisites.swift },
		requisites?.kbe && { label: 'Кбе', value: requisites.kbe },
		requisites?.knp && { label: 'КНП', value: requisites.knp },
	].filter(Boolean)

	if (purposeText) {
		fields.push({
			label: 'Назначение платежа',
			value: purposeText,
		})
	}

	const handleDownload = async () => {
		const url = `http://82.200.247.197:3030${data?.file_path}`
		if (!url) {
			Toast.show({ type: 'error', text1: 'Файл не доступен' })
			return
		}

		const nameFromUrl = decodeURIComponent(
			(url.split('?')[0] || '').split('/').pop() || ''
		)
		const filename = nameFromUrl || `document_${Date.now()}.pdf`

		try {
			if (Platform.OS === 'android') {
				const { DownloadDir } = RNFetchBlob.fs.dirs
				const destPath = `${DownloadDir}/${filename}`

				await RNFetchBlob.config({
					addAndroidDownloads: {
						useDownloadManager: true,
						notification: true,
						title: filename,
						description: 'Загрузка файла',
						mediaScannable: true,
						path: destPath,
					},
				}).fetch('GET', url)

				Toast.show({
					type: 'success',
					text1: 'Готово',
					text2: `Файл сохранён в Загрузки\n${destPath}`,
				})
			} else {
				const path = `${RNFetchBlob.fs.dirs.DocumentDir}/${filename}`
				const res = await RNFetchBlob.config({ fileCache: true, path }).fetch(
					'GET',
					url
				)
				RNFetchBlob.ios.openDocument(res.path())
			}
		} catch (e) {
			console.log('download error', e)
		}
	}

	return (
		<LinearGradient colors={['#091F44', '#3376F6']} style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Icon name='arrow-back' size={24} color='#fff' />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{title}</Text>
				<View style={{ width: 24 }} />
			</View>

			<ScrollView contentContainerStyle={styles.content}>
				<Text style={styles.sectionTitle}>Реквизиты</Text>

				{fields.map((field, index) => (
					<TopUpField
						key={index}
						label={field.label}
						value={field.value}
						copyable={true}
					/>
				))}

				<TouchableOpacity
					style={styles.downloadButton}
					onPress={handleDownload}
				>
					<Text style={styles.downloadButtonText}>Скачать документ</Text>
				</TouchableOpacity>
			</ScrollView>
		</LinearGradient>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		padding: 20,
	},
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
	sectionTitle: {
		color: '#fff',
		fontSize: 12,
		fontWeight: '600',
		marginBottom: 16,
		fontFamily: 'Montserrat',
	},
	downloadButton: {
		marginTop: 24,
		backgroundColor: '#fff',
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: 'center',
	},
	downloadButtonText: {
		color: '#000',
		fontWeight: '600',
		fontFamily: 'Montserrat',
	},
})
