import { useChangePinMutation } from '@/api/profileApi'
import { pinStorage } from '@/services/PinStorageService'
import React, { useRef, useState } from 'react'
import {
	Keyboard,
	KeyboardAvoidingView,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Toast from 'react-native-toast-message'
import Icon from 'react-native-vector-icons/Ionicons'

const ChangePinScreen = ({ navigation }: any) => {
	const [step, setStep] = useState<'old' | 'new' | 'confirm'>('old')
	const [oldPin, setOldPin] = useState('')
	const [newPin, setNewPin] = useState('')
	const [confirmPin, setConfirmPin] = useState('')
	const inputRef = useRef<TextInput>(null)

	const [changePin] = useChangePinMutation()

	const handleInput = async (text: string) => {
		if (text.length > 4) return

		if (step === 'old') {
			setOldPin(text)
			if (text.length === 4) setStep('new')
		} else if (step === 'new') {
			setNewPin(text)
			if (text.length === 4) setStep('confirm')
		} else if (step === 'confirm') {
			setConfirmPin(text)
			if (text.length === 4) {
				if (text !== newPin) {
					Toast.show({ type: 'error', text1: 'PIN-коды не совпадают' })
					setConfirmPin('')
					return
				}

				try {
					await changePin({ oldPin, newPin: text }).unwrap()
					await pinStorage.setPin(text)
					Toast.show({ type: 'success', text1: 'PIN-код успешно изменён' })
					navigation.goBack()
				} catch (err) {
					setOldPin('')
					setNewPin('')
					setConfirmPin('')
					setStep('old')
				}
			}
		}
	}

	const getTitle = () => {
		switch (step) {
			case 'old':
				return 'Введите текущий PIN-код'
			case 'new':
				return 'Введите новый PIN-код'
			case 'confirm':
				return 'Повторите новый PIN-код'
		}
	}

	const currentValue =
		step === 'old' ? oldPin : step === 'new' ? newPin : confirmPin

	return (
		<TouchableWithoutFeedback
			onPress={Keyboard.dismiss}
			style={styles.container}
		>
			<KeyboardAvoidingView style={{ flex: 1 }}>
				<LinearGradient
					colors={['rgb(51, 118, 246)', 'rgb(9, 32, 68)', 'rgb(0, 0, 0)']}
					style={{ flex: 1 }}
				>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => navigation.goBack()}>
							<Icon name='arrow-back' size={24} color='#fff' />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>Смена PIN-кода</Text>
						<View style={{ width: 24 }} />
					</View>

					<View style={styles.content}>
						<Text style={styles.title}>{getTitle()}</Text>

						<Pressable
							onPress={() => inputRef.current?.focus()}
							style={styles.codeContainer}
						>
							{Array.from({ length: 4 }).map((_, i) => (
								<View key={i} style={styles.codeBox}>
									<Text style={styles.codeText}>{currentValue[i] || ''}</Text>
								</View>
							))}
							<TextInput
								ref={inputRef}
								value={currentValue}
								onChangeText={handleInput}
								keyboardType='number-pad'
								maxLength={4}
								autoFocus
								style={styles.hiddenInput}
							/>
						</Pressable>
					</View>
				</LinearGradient>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	)
}

export default ChangePinScreen

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 48,
		paddingHorizontal: 24,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 50,
		padding: 12,
	},
	headerTitle: {
		color: '#fff',
		fontSize: 16,
		fontFamily: 'Montserrat',
		fontWeight: '600',
	},
	content: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		fontFamily: 'Montserrat',
		color: '#fff',
		marginBottom: 32,
		textAlign: 'center',
	},
	codeContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		position: 'relative',
		width: '80%',
	},
	codeBox: {
		width: 48,
		height: 56,
		borderRadius: 10,
		backgroundColor: 'rgba(255,255,255,0.15)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	codeText: {
		fontSize: 22,
		fontFamily: 'Montserrat',
		color: '#fff',
		fontWeight: '600',
	},
	hiddenInput: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		opacity: 0,
	},
})
