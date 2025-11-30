import {
	useGetQualificationQuery,
	useVerifyQualificationMutation,
} from '@/api/qualification'
import SuccessScreen from '@/components/SuccessScreen'
import { useNavigation } from '@react-navigation/native'
import React, { useState } from 'react'
import {
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'

const QualificationTest = () => {
	const navigation = useNavigation<any>()
	const [currentQuestion, setCurrentQuestion] = useState(0)
	const [selectedAnswers, setSelectedAnswers] = useState<{
		[key: number]: string
	}>({})
	const [isPassed, setIsPassed] = useState(false)
	const [showResult, setShowResult] = useState(false)
	const [verifyQualification, { isLoading }] = useVerifyQualificationMutation()
	const { data: qualification } = useGetQualificationQuery()
	const [score, setScore] = useState(0)
	const progress =
		((currentQuestion + 1) / qualification?.questions?.length) * 100

	const questions = qualification?.questions.map(
		(question: any, index: number) => ({ ...question, question: index })
	)

	const selectedAnswer = selectedAnswers[currentQuestion]
	const question = questions && questions[currentQuestion]

	const handleNext = () => {
		if (currentQuestion < qualification?.questions?.length - 1) {
			setCurrentQuestion(currentQuestion + 1)
		} else {
			checkResult()
		}
	}
	const handleAnswerSelect = (answerId: string) => {
		setSelectedAnswers(prev => ({
			...prev,
			[currentQuestion]: answerId,
		}))
	}


	const handleBack = () => {
		if (currentQuestion > 0) {
			setCurrentQuestion(currentQuestion - 1)
		} else {
			navigation.goBack()
		}
	}

	const checkResult = () => {
		verifyQualification({
			testId: qualification?.id,
			answers: Object.values(selectedAnswers),
		})
			.unwrap()
			.then(res => {
				setScore(res.score)
				setIsPassed(res.score >= 9)
				setShowResult(true)
			})
			.catch(err => {
				console.log(err, 'err')
			})
	}

	if (showResult) {
		return (
			<SuccessScreen
				title={
					isPassed ? 'Поздравляем! Вы успешно прошли тест' : 'Тест не пройден'
				}
				subtitle={
					isPassed
						? `Вы набрали ${score} из ${qualification?.questions?.length} баллов и успешно прошли тест на повышение квалификации.\n\nВаш статус будет обновлен`
						: `Не переживайте, это хороший повод попробовать снова.\nПроанализируйте ошибки и пройдите тест еще раз!`
				}
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
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.header}>
					<TouchableOpacity onPress={handleBack} style={styles.backButton}>
						<Icon name='arrow-back' size={24} color='#fff' />
					</TouchableOpacity>
					<View style={styles.progressContainer}>
						<View style={styles.progressBar}>
							<View style={[styles.progressFill, { width: `${progress}%` }]} />
						</View>
						<Text style={styles.progressText}>{Math.round(progress)}%</Text>
					</View>
				</View>

				<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
					<Text style={styles.questionNumber}>
						{currentQuestion + 1}. {question?.text}
					</Text>

					<View style={styles.answersContainer}>
						{question?.answers?.length > 0 &&
							question?.answers.map((answer: any) => (
								<TouchableOpacity
									key={answer.id}
									style={[styles.answerCard]}
									onPress={() => handleAnswerSelect(answer.id)}
								>
									<View style={styles.answerHeader}>
										<View
											style={[
												styles.radio,
												selectedAnswer === answer.id && styles.radioSelected,
											]}
										>
											{selectedAnswer === answer.id && (
												<View style={styles.radioInner} />
											)}
										</View>

										<Text
											style={[
												styles.answerText,
												selectedAnswer === answer.id &&
													styles.answerTextSelected,
											]}
										>
											{answer?.text}
										</Text>
									</View>
									<View style={styles.divider}></View>
								</TouchableOpacity>
							))}
					</View>
				</ScrollView>

				<View style={styles.footer}>
					<TouchableOpacity
						style={[
							styles.nextButton,
							!selectedAnswer && styles.nextButtonDisabled,
						]}
						onPress={handleNext}
						disabled={!selectedAnswer}
					>
						<Text style={styles.nextButtonText}>
							{currentQuestion < qualification?.questions?.length - 1
								? 'Далее'
								: 'Завершить'}
						</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</LinearGradient>
	)
}

export default QualificationTest

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
		paddingHorizontal: 12,
		paddingVertical: 16,
		gap: 16,
	},
	backButton: {
		padding: 4,
	},
	logo: {
		marginBottom: 32,
		width: 350,
		height: 250,
	},
	progressContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	progressBar: {
		flex: 1,
		height: 8,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		borderRadius: 4,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		backgroundColor: '#fff',
		borderRadius: 4,
	},
	progressText: {
		color: '#fff',
		fontSize: 14,
		fontFamily: 'Montserrat',
		fontWeight: '600',
		minWidth: 40,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	questionNumber: {
		color: '#fff',
		fontSize: 18,
		fontFamily: 'Montserrat',
		fontWeight: '600',
		marginBottom: 24,
		lineHeight: 26,
	},
	answersContainer: {},
	answerCard: {
		borderRadius: 12,
		padding: 16,
		borderWidth: 2,
		borderColor: 'transparent',
	},
	divider: {
		height: 1,
		width: '100%',
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
	},
	answerHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 8,
	},
	radio: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: 'rgba(255, 255, 255, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	radioSelected: {
		borderColor: '#fff',
	},
	radioInner: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: '#fff',
	},
	answerText: {
		color: 'rgba(255, 255, 255, 0.8)',
		fontSize: 14,
		fontFamily: 'Montserrat',
		lineHeight: 20,
	},
	answerTextSelected: {
		color: '#fff',
		fontWeight: '500',
	},
	footer: {
		paddingHorizontal: 20,
		paddingVertical: 16,
	},
	nextButton: {
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
	},
	nextButtonDisabled: {
		opacity: 0.5,
	},
	nextButtonText: {
		color: '#092044',
		fontSize: 16,
		fontFamily: 'Montserrat',
		fontWeight: '600',
	},
	resultContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 32,
	},

	logoText: {
		color: '#fff',
		fontSize: 60,
		fontFamily: 'Montserrat',
		fontWeight: 'bold',
	},
	resultTitle: {
		color: '#fff',
		fontSize: 24,
		fontFamily: 'Montserrat',
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 16,
	},
	resultSubtitle: {
		color: 'rgba(255, 255, 255, 0.8)',
		fontSize: 14,
		fontFamily: 'Montserrat',
		textAlign: 'center',
		lineHeight: 22,
		marginBottom: 32,
	},
	finishButton: {
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 32,
		minWidth: 200,
		alignItems: 'center',
	},
	finishButtonText: {
		color: '#092044',
		fontSize: 16,
		fontFamily: 'Montserrat',
		fontWeight: '600',
	},
})
