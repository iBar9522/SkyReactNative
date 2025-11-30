import React, { useEffect, useState } from 'react'
import {
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native'

type Props = {
	visible: boolean
	onClose: () => void
	onApply: (filters: { status?: number; dateRange?: string }) => void
	currentFilters: { status?: number; dateRange?: string }
}

const statuses = [
	{ key: 1, label: 'В обработке' },
	{ key: 3, label: 'На расчетах' },
	{ key: 4, label: 'Исполнено' },
	{ key: 5, label: 'Не исполнено' },
]

const dateRanges = [
	{ key: '3d', label: 'Последние 3 дня' },
	{ key: '7d', label: 'Последняя неделя' },
	{ key: '1m', label: 'Последний месяц' },
]

const TransactionHistoryFilterModal: React.FC<Props> = ({
	visible,
	onClose,
	onApply,
	currentFilters,
}) => {
	const [selectedStatus, setSelectedStatus] = useState<number | undefined>()
	const [selectedDate, setSelectedDate] = useState<string | undefined>()

	useEffect(() => {
		if (visible) {
			setSelectedStatus(currentFilters.status)
			setSelectedDate(currentFilters.dateRange)
		}
	}, [visible, currentFilters])

	const handleApply = () => {
		onApply({ status: selectedStatus, dateRange: selectedDate })
		onClose()
	}

	const handleReset = () => {
		setSelectedStatus(undefined)
		setSelectedDate(undefined)
		onApply({})
		onClose()
	}

	return (
		<Modal
			visible={visible}
			transparent
			animationType='slide'
			onRequestClose={onClose}
		>
			<TouchableWithoutFeedback onPress={onClose}>
				<View style={styles.backdrop}>
					<View style={styles.modalContent}>
						<View style={styles.handle} />

						<Text style={styles.sectionTitle}>По статусу</Text>
						{statuses.map(s => (
							<TouchableOpacity
								key={s.key}
								style={styles.radioRow}
								onPress={() => setSelectedStatus(s.key)}
							>
								<View
									style={[
										styles.radioOuter,
										selectedStatus === s.key && styles.radioOuterActive,
									]}
								>
									{selectedStatus === s.key && (
										<View style={styles.radioInner} />
									)}
								</View>
								<Text style={styles.radioLabel}>{s.label}</Text>
							</TouchableOpacity>
						))}

						<Text style={[styles.sectionTitle, { marginTop: 16 }]}>
							По дате
						</Text>
						<View style={styles.dateRow}>
							{dateRanges.map(d => (
								<TouchableOpacity
									key={d.key}
									style={[
										styles.dateButton,
										selectedDate === d.key && styles.dateButtonActive,
									]}
									onPress={() => setSelectedDate(d.key)}
								>
									<Text
										style={[
											styles.dateButtonText,
											selectedDate === d.key && styles.dateButtonTextActive,
										]}
									>
										{d.label}
									</Text>
								</TouchableOpacity>
							))}
						</View>

						<View style={styles.footer}>
							<TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
								<Text style={styles.resetText}>Сбросить</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
								<Text style={styles.applyText}>Применить</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</TouchableWithoutFeedback>
		</Modal>
	)
}

export default TransactionHistoryFilterModal

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.4)',
		justifyContent: 'flex-end',
	},
	modalContent: {
		backgroundColor: '#2B3A67',
		padding: 20,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
	},
	handle: {
		width: 50,
		height: 5,
		backgroundColor: 'rgba(255,255,255,0.3)',
		borderRadius: 3,
		alignSelf: 'center',
		marginBottom: 16,
	},
	sectionTitle: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 8,
	},
	radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
	radioOuter: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: '#aaa',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 8,
	},
	radioOuterActive: { borderColor: '#fff' },
	radioInner: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: '#fff',
	},
	radioLabel: { color: '#fff', fontSize: 14 },
	dateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
	dateButton: {
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.3)',
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 6,
		marginBottom: 8,
	},
	dateButtonActive: { backgroundColor: '#fff' },
	dateButtonText: { color: '#fff', fontSize: 14 },
	dateButtonTextActive: { color: '#000', fontWeight: '600' },
	footer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 20,
	},
	resetBtn: {
		flex: 1,
		marginRight: 10,
		paddingVertical: 14,
		borderRadius: 12,
		backgroundColor: 'rgba(255,255,255,0.15)',
		alignItems: 'center',
	},
	resetText: { color: '#fff', fontWeight: '600' },
	applyBtn: {
		flex: 1,
		marginLeft: 10,
		paddingVertical: 14,
		borderRadius: 12,
		backgroundColor: '#fff',
		alignItems: 'center',
	},
	applyText: { color: '#000', fontWeight: '600' },
})
