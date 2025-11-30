import React from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const orderTypes = ['Лимитная', 'Условная', 'Рыночная']

type Props = {
	orderType: string
	setOrderType: (val: string) => void
	visible: boolean
	setVisible: (v: boolean) => void
}

export default function OrderTypePicker({
	orderType,
	setOrderType,
	visible,
	setVisible,
}: Props) {
	return (
		<Modal
			animationType='slide'
			transparent
			visible={visible}
			onRequestClose={() => setVisible(false)}
		>
			<View style={styles.modalOverlay}>
				<View style={styles.modalContent}>
					<Text style={styles.modalTitle}>Выберите тип заявки</Text>
					{orderTypes.map((type, index) => (
						<TouchableOpacity
							key={index}
							style={styles.modalOption}
							onPress={() => {
								setOrderType(type)
								setVisible(false)
							}}
						>
							<Text
								style={[
									styles.modalOptionText,
									orderType === type && styles.modalOptionTextSelected,
								]}
							>
								{type}
							</Text>
						</TouchableOpacity>
					))}
					<TouchableOpacity
						style={styles.modalCloseButton}
						onPress={() => setVisible(false)}
					>
						<Text style={styles.modalCloseText}>Отмена</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'flex-end',
	},
	modalContent: {
		backgroundColor: '#1a2b47',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 40,
	},
	modalTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '600',
		textAlign: 'center',
		marginBottom: 20,
		fontFamily: 'Montserrat',
	},
	modalOption: {
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255, 255, 255, 0.1)',
	},
	modalOptionText: {
		color: 'rgba(255, 255, 255, 0.8)',
		fontSize: 16,
		fontFamily: 'Montserrat',
	},
	modalOptionTextSelected: {
		color: '#007AFF',
		fontWeight: '600',
	},
	modalCloseButton: {
		marginTop: 20,
		paddingVertical: 16,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderRadius: 12,
	},
	modalCloseText: {
		color: '#fff',
		fontSize: 16,
		textAlign: 'center',
		fontFamily: 'Montserrat',
	},
})
