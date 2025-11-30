import FormInput from '@/components/FormInput'
import TopUpField from '@/components/TopUpField'
import { useAuth } from '@/contexts/AuthContext'
import { navigate } from '@/services/NavigationService'
import { useNavigation } from '@react-navigation/native'
import React, { useState, useMemo } from 'react'
import {
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'

export default function WithdrawDetailsScreen() {
	const navigation = useNavigation()
	const { user } = useAuth()

	const [formData, setFormData] = useState({
		subAccountNumber: '',
		contractNumber: '',
		contractDate: '',
		accountNumber: '',
		correspondentNumber: '',
		bik: '',
	})

	const fullName =
		[user?.firstName, user?.lastName].filter(Boolean).join(' ') || '—'

	const isFormValid = useMemo(() => {
		return (
			formData.subAccountNumber.trim() !== '' &&
			formData.contractNumber.trim() !== '' &&
			formData.contractDate.trim() !== '' &&
			formData.accountNumber.trim() !== '' &&
			formData.correspondentNumber.trim() !== '' &&
			formData.bik.trim() !== ''
		)
	}, [formData])

	const updateField = (field: keyof typeof formData, value: string) => {
		setFormData(prev => ({
			...prev,
			[field]: value,
		}))
	}

	const handleSubmit = () => {
		if (isFormValid) {
			navigate('WithdrawSuccess')
		}
	}

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#091F44', '#3376F6']}
				style={StyleSheet.absoluteFill}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
			/>
			<View style={styles.overlay} />

			<SafeAreaView style={styles.safeArea}>
				<KeyboardAvoidingView
					style={styles.keyboardAvoidingView}
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
				>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => navigation.goBack()}>
							<Icon name='arrow-back' size={24} color='#fff' />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>Вывод средств</Text>
						<View style={{ width: 24 }} />
					</View>

					<ScrollView
						contentContainerStyle={styles.scroll}
						keyboardShouldPersistTaps='handled'
						showsVerticalScrollIndicator={false}
					>
						<TopUpField label='ФИО' value={fullName} copyable={false} />
						<TopUpField
							label='Наименование банка'
							value='Halyk Bank'
							copyable={false}
						/>

						<FormInput
							label='Номер субсчета'
							placeholder='Введите номер'
							keyboardType='numeric'
							value={formData.subAccountNumber}
							onChangeText={text => updateField('subAccountNumber', text)}
						/>

						<FormInput
							label='Номер договора'
							style={{ flex: 0.6 }}
							placeholder='1234'
							keyboardType='numeric'
							value={formData.contractNumber}
							onChangeText={text => updateField('contractNumber', text)}
						/>

						<FormInput
							label='Дата договора'
							style={{ flex: 0.4 }}
							placeholder='24/12/2024'
							value={formData.contractDate}
							onChangeText={text => updateField('contractDate', text)}
						/>

						<FormInput
							label='Номер расчетного счета'
							placeholder='Введите номер'
							keyboardType='numeric'
							value={formData.accountNumber}
							onChangeText={text => updateField('accountNumber', text)}
						/>

						<FormInput
							label='Номер корреспондентского счета'
							placeholder='Введите номер'
							keyboardType='numeric'
							value={formData.correspondentNumber}
							onChangeText={text => updateField('correspondentNumber', text)}
						/>

						<FormInput
							label='БИК'
							placeholder='Введите БИК'
							keyboardType='numeric'
							value={formData.bik}
							onChangeText={text => updateField('bik', text)}
						/>

						<View style={styles.bottomSpacer} />
					</ScrollView>

					<TouchableOpacity
						style={[
							styles.submitButton,
							!isFormValid && styles.submitButtonDisabled,
						]}
						onPress={handleSubmit}
						disabled={!isFormValid}
					>
						<Icon
							name='share-outline'
							size={24}
							color={isFormValid ? '#00244D' : '#999'}
						/>
						<Text
							style={[styles.buyText, !isFormValid && styles.buyTextDisabled]}
						>
							Вывести
						</Text>
					</TouchableOpacity>
				</KeyboardAvoidingView>
			</SafeAreaView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	keyboardAvoidingView: {
		flex: 1,
		justifyContent: 'space-between',
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.15)',
	},
	scroll: {
		padding: 20,
		flexGrow: 1,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		position: 'static',
		top: 0,
		left: 0,
		right: 0,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	headerTitle: {
		color: '#fff',
		fontSize: 16,
		fontFamily: 'Montserrat',
		fontWeight: '600',
	},
	bottomSpacer: {
		height: 80,
	},
	submitButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#fff',
		paddingVertical: 14,
		borderRadius: 30,
		gap: 10,
		marginHorizontal: 20,
		marginBottom: 16,
	},
	submitButtonDisabled: {
		backgroundColor: 'rgba(255, 255, 255, 0.5)',
		opacity: 0.6,
	},
	buyText: {
		fontWeight: '600',
		fontFamily: 'Montserrat',
		color: '#00244D',
	},
	buyTextDisabled: {
		color: '#999',
	},
})
