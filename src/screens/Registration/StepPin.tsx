import React, { useRef, useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	KeyboardAvoidingView,
	Pressable,
} from 'react-native'
import { UseFormReturn } from 'react-hook-form'
import { RegistrationFormValues } from '@/types/AuthTypes'

interface Props {
	form: UseFormReturn<RegistrationFormValues>
	onBack: () => void
	onNext: () => void
	onError?: () => void
}

const StepPin: React.FC<Props> = ({ form, onNext, onBack, onError }) => {
	const [pin, setPin] = useState('')
	const [confirmPin, setConfirmPin] = useState('')
	const [isConfirming, setIsConfirming] = useState(false)
	const [lastSubmittedPin, setLastSubmittedPin] = useState<string | null>(null)
	const inputRef = useRef<TextInput>(null)

	const handleInput = (value: string) => {
		if (value.length > 4) return
		if (!isConfirming) {
			setPin(value)
			if (value.length === 4) setIsConfirming(true)
		} else {
			setConfirmPin(value)
			if (value.length === 4 && value === pin) {
				if (lastSubmittedPin === value) return
				form.setValue('pin', value)
				setLastSubmittedPin(value)
				onNext()
			}
		}
	}

	const currentValue = isConfirming ? confirmPin : pin
	const title = isConfirming ? 'Повторите PIN-код' : 'Придумайте PIN-код'

	return (
		<KeyboardAvoidingView style={styles.container}>
			<Text style={styles.title}>{title}</Text>

			<Pressable onPress={() => inputRef.current?.focus()}>
				<View style={styles.codeContainer}>
					{Array.from({ length: 4 }).map((_, i) => (
						<View key={i} style={styles.codeBox}>
							<Text style={styles.codeText}>{currentValue[i] || ''}</Text>
						</View>
					))}
					<TextInput
						style={styles.hiddenInput}
						value={currentValue}
						ref={inputRef}
						onChangeText={handleInput}
						keyboardType='number-pad'
						maxLength={4}
						autoFocus
					/>
				</View>
			</Pressable>

			{isConfirming && confirmPin.length === 4 && confirmPin !== pin && (
				<Text style={styles.error}>PIN-коды не совпадают</Text>
			)}
		</KeyboardAvoidingView>
	)
}

export default StepPin

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
		justifyContent: 'center',
	},
	title: {
		fontFamily: 'Montserrat',
		fontSize: 28,
		fontWeight: '700',
		color: '#fff',
		textAlign: 'center',
		marginBottom: 32,
	},
	codeContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 16,
		position: 'relative',
	},
	codeBox: {
		width: 50,
		height: 50,
		borderRadius: 10,
		backgroundColor: 'rgba(255,255,255,0.2)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	codeText: {
		fontSize: 24,
		fontFamily: 'Montserrat',
		color: '#fff',
	},
	hiddenInput: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		opacity: 0,
	},
	error: {
		color: '#ff7a7a',
		textAlign: 'center',
		marginTop: 8,
	},
})
