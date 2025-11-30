import DateTimePicker from '@react-native-community/datetimepicker'
import React from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface Props {
	visible: boolean
	selectedDate: Date
	tempDate: Date
	setTempDate: (date: Date) => void
	onCancel: () => void
	onConfirm: () => void
	onDateChange: (event: any, date?: Date) => void
}

export default function OrderDatePicker({
	visible,
	selectedDate,
	tempDate,
	setTempDate,
	onCancel,
	onConfirm,
	onDateChange,
}: Props) {
	return (
		<Modal
			transparent={true}
			animationType='slide'
			visible={visible}
			onRequestClose={onCancel}
		>
			<View style={styles.datePickerModalOverlay}>
				<View style={styles.datePickerModalContent}>
					<View style={styles.datePickerHeader}>
						<TouchableOpacity
							onPress={onCancel}
							style={styles.datePickerCancelButton}
						>
							<Text style={styles.datePickerButtonText}>Отмена</Text>
						</TouchableOpacity>
						<Text style={styles.datePickerTitle}>Выберите дату</Text>
						<TouchableOpacity
							onPress={onConfirm}
							style={styles.datePickerDoneButton}
						>
							<Text
								style={[styles.datePickerButtonText, styles.datePickerDoneText]}
							>
								Готово
							</Text>
						</TouchableOpacity>
					</View>

					<DateTimePicker
						value={tempDate}
						mode='date'
						display='spinner'
						onChange={onDateChange}
						minimumDate={new Date()}
						style={styles.datePicker}
						themeVariant='dark'
						textColor='#fff'
					/>
				</View>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	datePickerModalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'flex-end',
	},
	datePickerModalContent: {
		backgroundColor: '#1a2b47',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingBottom: 20,
	},
	datePickerHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255, 255, 255, 0.1)',
	},
	datePickerTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '600',
		fontFamily: 'Montserrat',
	},
	datePickerCancelButton: {
		padding: 8,
	},
	datePickerDoneButton: {
		padding: 8,
	},
	datePickerButtonText: {
		color: 'rgba(255, 255, 255, 0.8)',
		fontSize: 16,
		fontFamily: 'Montserrat',
	},
	datePickerDoneText: {
		color: '#007AFF',
		fontWeight: '600',
	},
	datePicker: {
		alignSelf: 'center',
		width: '100%',
		backgroundColor: 'transparent',
	},
})
