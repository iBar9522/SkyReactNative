import React, { useRef, useEffect } from 'react'
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Dimensions,
	ActivityIndicator,
	TextInput,
} from 'react-native'
import Toast from 'react-native-toast-message'
import LinearGradient from 'react-native-linear-gradient'
import { toastConfig } from '@/App'
import { usePinFlow } from '@/hooks/usePinFlow'

interface PinLoginModalProps {
	onSuccess: () => void
	onClose: () => void
}

const { height } = Dimensions.get('window')

export default function PinLoginModal({
	onSuccess,
	onClose,
}: PinLoginModalProps) {
	const inputRef = useRef<TextInput>(null)

	const { step, pin, error, isLoading, onDigit, resetPin, onSubmit, close } =
		usePinFlow(onSuccess, onClose)

	useEffect(() => {
		setTimeout(() => inputRef.current?.focus(), 100)
	}, [])

	useEffect(() => {
		if (pin.length === 0) {
			inputRef.current?.focus()
		}
	}, [pin])

	const title =
		step === 'create'
			? 'Введите новый PIN-код'
			: step === 'confirm'
			? 'Повторите PIN-код'
			: 'Введите PIN-код'

	return (
		<LinearGradient colors={['#091F44', '#3376F6']} style={styles.container}>
			<Toast topOffset={70} config={toastConfig} />

			<View style={styles.content}>
				<Text style={styles.title}>{title}</Text>

				<TouchableOpacity
					activeOpacity={1}
					onPress={() => inputRef.current?.focus()}
					style={styles.dotsContainer}
				>
					{[0, 1, 2, 3].map(i => (
						<View
							key={i}
							style={[
								styles.dot,
								{
									backgroundColor:
										pin.length > i ? '#fff' : 'rgba(255,255,255,0.25)',
								},
								error && { backgroundColor: '#FF6B6B' },
							]}
						/>
					))}
				</TouchableOpacity>

				<TextInput
					ref={inputRef}
					value={pin}
					onChangeText={t => {
						if (t.length < pin.length) {
							resetPin()
						} else if (t.length <= 4) {
							onDigit(t[t.length - 1])
						}
					}}
					keyboardType='number-pad'
					maxLength={4}
					secureTextEntry
					style={{ position: 'absolute', opacity: 0 }}
					onSubmitEditing={onSubmit}
				/>

				<View style={styles.footer}>
					{step === 'enter' && (
						<Text style={styles.forgot}>Забыли PIN-код?</Text>
					)}
					<TouchableOpacity onPress={close}>
						<Text style={styles.link}>
							{step === 'enter'
								? 'Войти через номер телефона'
								: 'Установить позже'}
						</Text>
					</TouchableOpacity>
				</View>

				<TouchableOpacity
					onPress={onSubmit}
					style={[styles.loginBtn, pin.length < 4 && { opacity: 0.5 }]}
					disabled={pin.length < 4}
				>
					<Text style={styles.loginText}>
						{step === 'enter' ? 'Войти' : 'Продолжить'}
					</Text>
				</TouchableOpacity>
			</View>

			{isLoading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size='large' color='#FFFFFF' />
				</View>
			)}
		</LinearGradient>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	content: {
		width: '100%',
		height,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 30,
		paddingBottom: 80,
	},
	title: {
		fontSize: 22,
		fontWeight: '600',
		color: '#FFFFFF',
		marginBottom: 40,
	},
	dotsContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 16,
		marginBottom: 60,
	},
	dot: {
		width: 16,
		height: 16,
		borderRadius: 8,
	},
	forgot: {
		color: 'rgba(255,255,255,0.6)',
		fontSize: 14,
		textAlign: 'center',
	},
	link: {
		color: '#FFFFFF',
		fontWeight: '600',
		fontSize: 14,
		textDecorationLine: 'underline',
		textAlign: 'center',
	},
	footer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	loginBtn: {
		position: 'absolute',
		bottom: 50,
		backgroundColor: 'rgba(255,255,255,0.2)',
		paddingVertical: 14,
		paddingHorizontal: 80,
		borderRadius: 14,
	},
	loginText: { color: '#fff', fontWeight: '600', fontSize: 16 },
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.25)',
		justifyContent: 'center',
		alignItems: 'center',
	},
})
