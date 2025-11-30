import { HbOrderResponse } from '@/types/LegacyAdapterTypes'
import React from 'react'
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
	row: HbOrderResponse | null
}

const TransactionHistoryDetailsModal: React.FC<Props> = ({
	visible,
	onClose,
	row,
}) => {
	if (!row) return null

	const orderDate = row?.orderDate
		? new Date(row.orderDate).toLocaleString('ru-RU', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
		  })
		: '—'

	const getStatusColor = (status?: string) => {
		if (!status) return '#FFFFFF'
		const s = status.toLowerCase()

		if (s.includes('не исполнен') || s.includes('отклонено')) return '#FF5C5C' // красный
		if (s.includes('на расчетах')) return '#06D6A0' // зелёный
		if (
			s.includes('исполнен') ||
			s.includes('подтвержден') ||
			s.includes('заявка исполнена')
		)
			return '#FAFAFA' // серый

		return '#FFD700' // жёлтый
	}

	const amountColor = getStatusColor(row.status)

	return (
		<Modal
			transparent
			visible={visible}
			animationType='slide'
			onRequestClose={onClose}
		>
			<TouchableWithoutFeedback onPress={onClose}>
				<View style={styles.backdrop}>
					<TouchableWithoutFeedback>
						<View style={styles.modalContent}>
							<View style={styles.handle} />

							<View style={styles.header}>
								<View style={styles.logoCircle}>
									<Text
										style={{ fontSize: 18, fontWeight: '700', color: '#000' }}
									>
										{row.instrumentCode?.[0] ?? '?'}
									</Text>
								</View>
								<View style={{ marginLeft: 12 }}>
									<Text style={styles.title}>{row.ticker}</Text>
									<Text
										style={[
											styles.status,
											{ color: getStatusColor(row.status) },
										]}
									>
										{row.status || 'В обработке'}
									</Text>
								</View>
							</View>

							<Text style={styles.label}>Сумма заявки:</Text>
							<Text style={[styles.amount, { color: amountColor }]}>
								{row.amount?.toLocaleString('ru-RU')} {row.currency}
							</Text>

							<View style={styles.divider} />

							<View style={styles.detailRow}>
								<Text style={styles.detailLabel}>Дата и время:</Text>
								<Text style={styles.detailValue}>{orderDate}</Text>
							</View>

							<View style={styles.detailRow}>
								<Text style={styles.detailLabel}>Номер заявки:</Text>
								<Text style={styles.detailValue}>{row.orderNumber}</Text>
							</View>

							<TouchableOpacity style={styles.button} onPress={onClose}>
								<Text style={styles.buttonText}>Закрыть</Text>
							</TouchableOpacity>
						</View>
					</TouchableWithoutFeedback>
				</View>
			</TouchableWithoutFeedback>
		</Modal>
	)
}

export default TransactionHistoryDetailsModal

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)',
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
	header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
	logoCircle: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: { color: '#fff', fontSize: 18, fontWeight: '600' },
	status: { fontSize: 14, fontWeight: '500', marginTop: 4 },

	label: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 8 },
	amount: {
		fontSize: 28,
		fontWeight: 'bold',
		marginVertical: 8,
		textAlign: 'center',
	},
	divider: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: 'rgba(255,255,255,0.2)',
		marginVertical: 16,
	},
	detailRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginVertical: 6,
	},
	detailLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
	detailValue: { color: '#fff', fontSize: 14, fontWeight: '500' },

	button: {
		marginTop: 24,
		backgroundColor: '#fff',
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: 'center',
	},
	buttonText: { color: '#000', fontSize: 16, fontWeight: '600' },
})
