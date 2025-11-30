import React, { useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	SafeAreaView,
	ScrollView,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import SuccessScreen from '@/components/SuccessScreen'
import { navigate } from '@/services/NavigationService'

const CRITERIA_LIST = [
	'Высшее образование (экономика, финансы, математика, IT)',
	'Международные сертификаты (CFA, CIIA, FRM и др.)',
	'Опыт работы от 3-х лет в сфере инвестиций или управления рисками',
	'Финансовые активы свыше 8 500 МРП',
	'Опыт 50+ сделок на бирже за последние 12 месяцев',
]

const QualificationCriteria = () => {
	const navigation = useNavigation<any>()
	const [checked, setChecked] = useState(false)
	const [showSuccess, setShowSuccess] = useState(false)

	const handleBack = () => navigation.goBack()
	const handleUpload = () => navigate('QualificationUpload')
	const handleContinue = () => navigation.navigate('QualificationIntro')

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
					<Text style={styles.title}>Подтвердить соответствие критериям</Text>
					<Text style={styles.subtitle}>
						Прикрепите документы, подтверждающие как минимум один критерий:
					</Text>

					<View style={styles.list}>
						{CRITERIA_LIST.map((item, index) => (
							<Text key={index} style={styles.listItem}>
								• {item}
							</Text>
						))}
					</View>

					<TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
						<Text style={styles.uploadText}>Загрузить документ</Text>
					</TouchableOpacity>

					<View style={styles.checkboxContainer}>
						<TouchableOpacity
							style={[styles.checkbox, checked && styles.checkboxChecked]}
							onPress={() => setChecked(!checked)}
						>
							{checked && <Icon name='checkmark' size={16} color='#092044' />}
						</TouchableOpacity>
						<Text style={styles.checkboxLabel}>
							Подтверждаю, что не соответствую ни одному из вышеуказанных
							критериев и несу ответственность за достоверность этой информации
						</Text>
					</View>
				</ScrollView>

				<View style={styles.footer}>
					<TouchableOpacity
						style={[styles.continueButton, !checked && styles.continueDisabled]}
						onPress={handleContinue}
						disabled={!checked}
					>
						<Text style={styles.continueText}>Продолжить</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</LinearGradient>
	)
}

export default QualificationCriteria

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
		marginBottom: 10,
	},
	subtitle: {
		color: '#fff',
		fontSize: 14,
		fontFamily: 'Montserrat',
		lineHeight: 22,
		marginBottom: 16,
	},
	list: { marginBottom: 24 },
	listItem: {
		color: '#fff',
		fontSize: 14,
		fontFamily: 'Montserrat',
		lineHeight: 24,
	},
	uploadButton: {
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingVertical: 14,
		alignItems: 'center',
		marginBottom: 20,
	},
	uploadText: {
		color: '#092044',
		fontSize: 16,
		fontWeight: '600',
		fontFamily: 'Montserrat',
	},
	checkboxContainer: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
		marginTop: 8,
	},
	checkbox: {
		width: 20,
		height: 20,
		borderRadius: 4,
		borderWidth: 2,
		borderColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	checkboxChecked: {
		backgroundColor: '#fff',
	},
	checkboxLabel: {
		color: '#fff',
		flex: 1,
		fontSize: 12,
		fontFamily: 'Montserrat',
		lineHeight: 18,
	},
	footer: { padding: 20 },
	continueButton: {
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
	},
	continueDisabled: { opacity: 0.5 },
	continueText: {
		color: '#092044',
		fontSize: 16,
		fontFamily: 'Montserrat',
		fontWeight: '600',
	},
})
