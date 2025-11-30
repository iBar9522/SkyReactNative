import { useAuth } from '@/contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'
import React from 'react'
import {
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'

const QualificationIntro = () => {
	const navigation = useNavigation<any>()
	const { user } = useAuth()

	const handleBack = () => {
		navigation.goBack()
	}

	const handleStartTest = () => {
		navigation.navigate('QualificationTest')
	}

	return (
		<LinearGradient
			colors={['rgb(51, 118, 246)', 'rgb(9, 32, 68)', 'rgb(0, 0, 0)']}
			style={styles.container}
		>
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.header}>
					<TouchableOpacity onPress={handleBack} style={styles.backButton}>
						<Icon name='arrow-back' size={24} color='#fff' />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Квалификация</Text>
				</View>

				<View style={styles.content}>
					<Text style={styles.mainTitle}>
						Тест на квалификацию{'\n'}инвестора
					</Text>

					<Text style={styles.description}>
						Перед вами короткий тест из 10 вопросов, который поможет подтвердить
						ваш статус квалифицированного инвестора.
					</Text>

					<Text style={styles.instruction}>
						Для успешного прохождения допускается не более 1 ошибки.
					</Text>
				</View>

				<View style={styles.footer}>
					<TouchableOpacity
						style={styles.startButton}
						onPress={handleStartTest}
					>
						<Text style={styles.startButtonText}>Пройти тест</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</LinearGradient>
	)
}

export default QualificationIntro

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 16,
		gap: 80,
	},
	backButton: {
		padding: 4,
	},
	headerTitle: {
		color: '#fff',
		fontSize: 18,
		fontFamily: 'Montserrat',
		fontWeight: '600',
	},
	content: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 32,
	},
	mainTitle: {
		color: '#fff',
		fontSize: 28,
		fontFamily: 'Montserrat',
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 24,
		lineHeight: 36,
	},
	description: {
		color: '#fff',
		fontSize: 16,
		fontFamily: 'Montserrat',
		textAlign: 'center',
		lineHeight: 24,
		marginBottom: 16,
	},
	instruction: {
		color: '#fff',
		fontSize: 16,
		fontFamily: 'Montserrat',
		textAlign: 'center',
		lineHeight: 24,
	},
	footer: {
		paddingHorizontal: 20,
		paddingVertical: 24,
	},
	startButton: {
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
	},
	startButtonText: {
		color: '#092044',
		fontSize: 16,
		fontFamily: 'Montserrat',
		fontWeight: '600',
	},
})
