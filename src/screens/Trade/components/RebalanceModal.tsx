import React from 'react'
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native'

type Props = {
	type: 'confirm' | 'info'
	visible: boolean
	onConfirm?: () => void
	onCancel?: () => void
}

export default function RebalanceModal({
	type,
	visible,
	onConfirm,
	onCancel,
}: Props) {
	if (!visible) return null

	return (
		<Modal
			transparent
			visible={visible}
			animationType='fade'
			onRequestClose={onCancel}
		>
			<View style={styles.overlay}>
				<View style={styles.container}>
					<Text style={styles.title}>
						{type === 'confirm'
							? 'Недостаточно средств на одном счёте'
							: 'Средства будут ребалансированы'}
					</Text>

					<Text style={styles.text}>
						{type === 'confirm'
							? 'Ваши средства распределены по нескольким счетам. Для покупки ценной бумаги потребуется ребалансировка средств между ними. Это может повлиять на время исполнения приказа.'
							: 'Ребалансировка может занять некоторое время. После завершения вы получите уведомление, и покупка будет выполнена автоматически.'}
					</Text>

					{type === 'confirm' ? (
						<>
							<TouchableOpacity
								style={[styles.button, styles.buttonPrimary]}
								onPress={onConfirm}
							>
								<Text style={styles.buttonPrimaryText}>
									Согласиться и продолжить
								</Text>
							</TouchableOpacity>

							<TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
								<Text style={styles.cancelText}>Отменить</Text>
							</TouchableOpacity>
						</>
					) : (
						<TouchableOpacity
							style={[styles.button, styles.buttonPrimary]}
							onPress={onCancel}
						>
							<Text style={styles.buttonPrimaryText}>Понятно</Text>
						</TouchableOpacity>
					)}
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
		backgroundColor: 'rgba(14, 27, 54, 0.7)',
		borderRadius: 16,
		paddingVertical: 24,
		paddingHorizontal: 20,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.2)',
		alignItems: 'center',
	},
	title: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 12,
		textAlign: 'center',
	},
	text: {
		color: 'rgba(255,255,255,0.85)',
		fontSize: 14,
		textAlign: 'center',
		lineHeight: 20,
		marginBottom: 24,
	},
	button: {
		width: '100%',
		paddingVertical: 14,
		borderRadius: 10,
		alignItems: 'center',
		marginBottom: 10,
	},
	buttonPrimary: {
		backgroundColor: '#fff',
	},
	buttonPrimaryText: {
		color: '#000',
		fontSize: 16,
		fontWeight: '600',
	},
	buttonSecondary: {
		backgroundColor: 'rgba(255,255,255,0.1)',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.2)',
	},
	buttonSecondaryText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '500',
	},
	cancelBtn: { marginTop: 4 },
	cancelText: {
		color: 'rgba(255,255,255,0.7)',
		fontSize: 14,
		textDecorationLine: 'underline',
	},
})
