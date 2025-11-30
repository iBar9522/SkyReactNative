import React, { useEffect, useRef, useState } from 'react'
import {
	Modal,
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	TextInput,
} from 'react-native'

type Props = {
	visible: boolean
	onClose: () => void
	onConfirm: (code: string) => Promise<void>
	onSuccess: () => void
	onResend?: () => Promise<void>
}

export default function SmsCodeModal({
	visible,
	onClose,
	onConfirm,
	onSuccess,
	onResend,
}: Props) {
	const [code, setCode] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const inputRef = useRef<TextInput>(null)

	useEffect(() => {
		if (visible) {
			setCode('')
			setError(null)
			const t = setTimeout(() => inputRef.current?.focus(), 150)
			return () => clearTimeout(t)
		}
	}, [visible])

	const handleConfirm = async () => {
		if (code.length < 6) {
			setError('Введите 6-значный код')
			return
		}
		setError(null)
		setLoading(true)
		try {
			await onConfirm(code)
			onSuccess()
			onClose()
			setCode('')
		} catch {
			setError('Код введен неправильно')
		} finally {
			setLoading(false)
		}
	}

	const renderCells = () => {
		const cells = []
		for (let i = 0; i < 6; i++) {
			cells.push(
				<View key={i} style={[styles.cell, error && styles.inputError]}>
					<Text style={styles.cellText}>{code[i] || ''}</Text>
				</View>
			)
		}
		return cells
	}

	return (
		<Modal
			transparent
			visible={visible}
			animationType='fade'
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				<View style={styles.container}>
					<Text style={styles.title}>Подтверждение сделки</Text>

					<TextInput
						ref={inputRef}
						style={styles.hiddenInput}
						value={code}
						onChangeText={t => setCode(t.replace(/[^\d]/g, ''))}
						onSubmitEditing={handleConfirm}
						keyboardType='number-pad'
						maxLength={6}
						autoFocus
						blurOnSubmit={false}
					/>

					<TouchableOpacity
						activeOpacity={1}
						onPress={() => inputRef.current?.focus()}
					>
						<View style={styles.codeRow}>{renderCells()}</View>
					</TouchableOpacity>

					{error && <Text style={styles.error}>{error}</Text>}

					{onResend && (
						<TouchableOpacity onPress={onResend} style={{ marginTop: 10 }}>
							<Text style={styles.resend}>Отправить код повторно</Text>
						</TouchableOpacity>
					)}

					<TouchableOpacity
						style={[
							styles.confirmBtn,
							(loading || code.length < 6) && { opacity: 0.6 },
						]}
						onPress={handleConfirm}
						disabled={loading || code.length < 6}
					>
						<Text style={styles.confirmText}>
							{loading ? 'Проверка...' : 'Подтвердить'}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
						<Text style={styles.cancelText}>Отменить</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.6)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	container: {
		width: '95%',
		backgroundColor: '#1a2b47',
		borderRadius: 12,
		padding: 24,
		alignItems: 'center',
	},
	title: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 20 },
	hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
	codeRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		marginBottom: 12,
	},
	cell: {
		width: 45,
		height: 55,
		borderRadius: 8,
		backgroundColor: 'rgba(255,255,255,0.05)',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.2)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	cellText: { color: '#fff', fontSize: 22, fontWeight: '500' },
	inputError: { borderColor: '#ff5a5a' },
	error: { color: '#ff5a5a', marginBottom: 8, fontSize: 14 },
	resend: { color: '#4da6ff', fontSize: 14, marginBottom: 16 },
	confirmBtn: {
		backgroundColor: '#fff',
		paddingVertical: 12,
		borderRadius: 8,
		width: '100%',
		alignItems: 'center',
	},
	confirmText: { color: '#000', fontWeight: '600', fontSize: 16 },
	cancelBtn: { marginTop: 12 },
	cancelText: { color: '#aaa', fontSize: 14 },
})
