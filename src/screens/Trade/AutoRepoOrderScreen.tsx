import React, { useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Image,
	StatusBar,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormInput from '@/components/FormInput'
import Select from '@/components/Select'
import Button from '@/components/Button'
import Icon from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import OrderDatePicker from './components/OrderDatePicker'

export default function AutoRepoOrderScreen() {
	const [orderType, setOrderType] = useState<'Рыночный' | 'Условный'>(
		'Рыночный'
	)
	const [object, setObject] = useState('')
	const [duration, setDuration] = useState('1 день')
	const [rate, setRate] = useState('')
	const [lots, setLots] = useState('')

	const [startDate, setStartDate] = useState(new Date())
	const [endDate, setEndDate] = useState(
		new Date(Date.now() + 24 * 60 * 60 * 1000)
	)
	const [showStartPicker, setShowStartPicker] = useState(false)
	const [showEndPicker, setShowEndPicker] = useState(false)
	const [tempDate, setTempDate] = useState(new Date())

	const navigation = useNavigation()

	const handleStartDatePress = () => {
		setTempDate(startDate)
		setShowStartPicker(true)
	}

	const handleEndDatePress = () => {
		setTempDate(endDate)
		setShowEndPicker(true)
	}

	const handleDatePickerCancel = () => {
		setShowStartPicker(false)
		setShowEndPicker(false)
	}

	const handleDatePickerDone = () => {
		if (showStartPicker) {
			setStartDate(tempDate)
			setShowStartPicker(false)
		} else if (showEndPicker) {
			setEndDate(tempDate)
			setShowEndPicker(false)
		}
	}

	const onDateChange = (_: any, date?: Date) => {
		if (date) setTempDate(date)
	}

	return (
		<View style={styles.screen}>
			<StatusBar barStyle='light-content' />
			<LinearGradient
				colors={['#091F44', '#3376F6']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				style={StyleSheet.absoluteFill}
			/>

			<SafeAreaView style={styles.safe}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => navigation.goBack()}>
						<Icon name='arrow-back' size={24} color='#fff' />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>АвтоРЕПО</Text>
					<View style={{ width: 24 }} />
				</View>

				<ScrollView contentContainerStyle={styles.content}>
					<Text style={styles.sectionTitle}>Оформление приказа</Text>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Тип приказа</Text>
						<Select
							value={orderType}
							options={[
								{ label: 'Рыночный', value: 'Рыночный' },
								{ label: 'Условный', value: 'Условный' },
							]}
							onSelect={setOrderType}
						/>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Объект АвтоРЕПО</Text>
						<Select
							value={object}
							placeholder='Выберите объект'
							options={[
								{ label: 'ГЦБ', value: 'ГЦБ' },
								{ label: 'Бумага 1', value: 'Бумага 1' },
								{ label: 'Бумага 2', value: 'Бумага 2' },
								{ label: 'Бумага 3', value: 'Бумага 3' },
							]}
							onSelect={setObject}
						/>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Выберите срок АвтоРЕПО</Text>
						<Select
							value={duration}
							options={[
								{ label: '1 день', value: '1 день' },
								{ label: '7 дней', value: '7 дней' },
								{ label: '14 дней', value: '14 дней' },
							]}
							onSelect={setDuration}
						/>
					</View>

					<View style={styles.quotesCard}>
						<View style={styles.quotesHeader}>
							<Text style={styles.quotesTitle}>Котировки</Text>
							<TouchableOpacity>
								<Text style={styles.quotesLink}>Подробнее</Text>
							</TouchableOpacity>
						</View>

						<View style={styles.quotesRowHeader}>
							<Text style={styles.quotesCol}>Привлечение, лоты</Text>
							<Text style={styles.quotesCol}>Ставка, %</Text>
							<Text style={styles.quotesCol}>Размещение, лоты</Text>
						</View>

						<View style={styles.quotesRow}>
							<Text style={[styles.quotesText, styles.red]}>2 899</Text>
							<Text style={[styles.quotesText, styles.red]}>15,6800</Text>
							<Text style={[styles.quotesText, styles.green]}>5 000</Text>
						</View>

						<View style={styles.quotesRow}>
							<Text style={[styles.quotesText, styles.green]}>3 000</Text>
							<Text style={[styles.quotesText, styles.green]}>16,3500</Text>
							<Text style={[styles.quotesText, styles.green]}>4 500</Text>
						</View>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>
							{orderType === 'Условный'
								? 'Ставка АвтоРЕПО не ниже:'
								: 'Ставка АвтоРЕПО'}
						</Text>

						{orderType === 'Рыночный' ? (
							<FormInput placeholder='По текущему рынку' disabled />
						) : (
							<FormInput
								placeholder='%'
								keyboardType='decimal-pad'
								value={rate}
								onChangeText={setRate}
							/>
						)}
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Количество лотов</Text>
						<FormInput
							placeholder='Введите количество лотов'
							keyboardType='number-pad'
							value={lots}
							onChangeText={setLots}
						/>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Дата начала действия приказа</Text>
						<TouchableOpacity
							style={styles.dateInput}
							onPress={handleStartDatePress}
						>
							<Text style={styles.dateText}>
								{startDate.toLocaleDateString('ru-RU')}
							</Text>
							<Image
								source={require('@/assets/calendar-icon.png')}
								style={styles.calendarIcon}
							/>
						</TouchableOpacity>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Срок действия приказа</Text>
						<TouchableOpacity
							style={styles.dateInput}
							onPress={handleEndDatePress}
						>
							<Text style={styles.dateText}>
								{endDate.toLocaleDateString('ru-RU')}
							</Text>
							<Image
								source={require('@/assets/calendar-icon.png')}
								style={styles.calendarIcon}
							/>
						</TouchableOpacity>
					</View>

					<View style={styles.totalBox}>
						<Text style={styles.totalLabel}>Итого сумма:</Text>
						<View style={styles.totalValueBox}>
							<Text style={styles.totalValue}>-</Text>
						</View>
					</View>

					<Button
						title='Подать приказ'
						style={styles.submitBtn}
						textStyle={styles.submitBtnText}
						textSize={16}
					/>
				</ScrollView>
			</SafeAreaView>

			<OrderDatePicker
				visible={showStartPicker || showEndPicker}
				selectedDate={showStartPicker ? startDate : endDate}
				tempDate={tempDate}
				setTempDate={setTempDate}
				onCancel={handleDatePickerCancel}
				onConfirm={handleDatePickerDone}
				onDateChange={onDateChange}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: '#0E1B36' },
	safe: { flex: 1 },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		height: 56,
		justifyContent: 'space-between',
		paddingHorizontal: 16,
	},
	headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },

	content: { padding: 16, paddingBottom: 40 },
	sectionTitle: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 20,
	},

	formGroup: { marginBottom: 20 },
	label: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 6 },

	dateInput: {
		backgroundColor: 'rgba(255,255,255,0.1)',
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		flexDirection: 'row',
		justifyContent: 'space-between',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.2)',
	},
	dateText: { color: '#fff', fontSize: 16 },
	calendarIcon: { width: 20, height: 20, tintColor: '#fff' },

	quotesCard: {
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderRadius: 12,
		padding: 12,
		marginBottom: 24,
	},
	quotesHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	quotesTitle: { color: '#fff', fontWeight: '600', fontSize: 15 },
	quotesLink: {
		color: '#9BB6FF',
		fontSize: 13,
		textDecorationLine: 'underline',
	},
	quotesRowHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 6,
	},
	quotesCol: {
		color: 'rgba(255,255,255,0.6)',
		fontSize: 12,
		flex: 1,
		textAlign: 'center',
	},
	quotesRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginVertical: 4,
	},
	quotesText: { flex: 1, textAlign: 'center', fontSize: 13, fontWeight: '500' },
	red: { color: '#FF6B6B' },
	green: { color: '#4CD964' },

	totalBox: { alignItems: 'center', marginTop: 8, marginBottom: 16 },
	totalLabel: { color: '#fff', fontSize: 15, marginBottom: 6 },
	totalValueBox: {
		backgroundColor: 'rgba(255,255,255,0.1)',
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 40,
	},
	totalValue: { color: '#fff', fontSize: 18, fontWeight: '600' },

	submitBtn: {
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingVertical: 16,
		marginTop: 8,
	},
	submitBtnText: { textAlign: 'center' },
})
