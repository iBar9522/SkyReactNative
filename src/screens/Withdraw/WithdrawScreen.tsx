import FormInput from '@/components/FormInput'
import TopUpField from '@/components/TopUpField'
import SmsCodeModal from '@/components/SmsCodeModal'
import SuccessScreen from '@/components/SuccessScreen'
import { useAuth } from '@/contexts/AuthContext'
import React, { useEffect, useState } from 'react'
import {
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	FlatList,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'
import { useGetBanksQuery } from '@/api/utilsApi'
import {
	useSendSmsCodeMutation,
	useVerifyCodeMutation,
} from '@/api/notificationsApi'
import { useNavigation } from '@react-navigation/native'
import {
	useAddBuySellOrderDirectusMutation,
	useCreateHbPutMtoMutation,
	useGetHbFreeMoneyByUserIdMutation,
} from '@/api/legacyAdapterApi'

export default function WithdrawScreen() {
	const navigation = useNavigation<any>()
	const { user } = useAuth()

	const [bank, setBank] = useState('')
	const [customBank, setCustomBank] = useState('')
	const [accountNumber, setAccountNumber] = useState('')
	const [swift, setSwift] = useState('')
	const [currency, setCurrency] = useState('')
	const [amount, setAmount] = useState('')
	const [accountDropdownOpen, setAccountDropdownOpen] = useState(false)
	const [bankDropdownOpen, setBankDropdownOpen] = useState(false)
	const [smsVisible, setSmsVisible] = useState(false)
	const [successVisible, setSuccessVisible] = useState(false)
	const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
	const [selectedAccount, setSelectedAccount] = useState<any>(null)

	const [
		getHbFreeMoneyByUserId,
		{ data: freeMoney, isLoading: freeMoneyLoading },
	] = useGetHbFreeMoneyByUserIdMutation()
	const { data: banks, isLoading: isBanksLoading } = useGetBanksQuery()
	const [sendSmsCode] = useSendSmsCodeMutation()
	const [verifyCode] = useVerifyCodeMutation()
	const [addBuySellOrderDirectus] = useAddBuySellOrderDirectusMutation()
	const [createHbPutMto] = useCreateHbPutMtoMutation()

	const availableCurrencies = ['KZT', 'USD']

	const isFormValid =
		bank &&
		currency &&
		amount &&
		(bank !== 'Другой банк' || (customBank && accountNumber && swift))

	useEffect(() => {
		if (user?.oracleClientId) {
			getHbFreeMoneyByUserId({ userId: user?.oracleClientId })
		}
	}, [user?.oracleClientId])

	const handleNext = async () => {
		try {
			await sendSmsCode({ phone: user?.phone }).unwrap()
			setSmsVisible(true)
		} catch (error) {
			console.error('Ошибка при отправке SMS:', error)
		}
	}

	const requestSmsConfirm = async (code: string) => {
		return await verifyCode({ target: user?.phone, code }).unwrap()
	}

	const handleConfirmWithdraw = async () => {
		try {
			setIsLoadingSubmit(true)

			const mtoPayload = {
				p_userId: user?.oracleClientId,
				vMTO_Date: new Date().toISOString(),
				vCurrency: currency,
				vAmount: Number(amount),
				vRecipient: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
				vRecipientBank: bank === 'Другой банк' ? customBank : bank,
				vBik: 'HSBKKZKX', // TODO: заменить на реальный БИК выбранного банка
				vRecipientIic: accountNumber,
				vRecipientTprn: selectedAccount?.subAccount ?? '',
				vKbe: '17',
				vTo_FT_ID: selectedAccount?.ftId ?? user.personal_account,
				vFT_ID: Number(selectedAccount?.ftId ?? 0),
				vCardAccount: selectedAccount?.subAccount ?? '',
				vSwiftRecipientBank: swift || '',
				vCorrAcc: '',
				vCorrBank: selectedAccount?.holdingPlace ?? '',
				vSwiftCorrBank: '',
				vKnp: '171',
				vPaymentPurposeText: 'Вывод средств на личный счёт',
				vSignOrderBody: '<SignedOrderBody>...</SignedOrderBody>',
				vSigned_By_SMS_Bool: 1,
				vMTO_Number: `MTO-${Date.now()}`,
			}

			await createHbPutMto({ body: mtoPayload }).unwrap()

			setSmsVisible(false)
			setSuccessVisible(true)
		} catch (e) {
			console.error('Ошибка при создании поручения:', e)
		} finally {
			setIsLoadingSubmit(false)
		}
	}

	const renderDropdown = (
		items: string[],
		onSelect: (item: string) => void,
		currentValue: string,
		isOpen: boolean,
		toggleOpen: (open: boolean) => void
	) => (
		<View style={styles.dropdownWrapper}>
			<TouchableOpacity
				style={styles.dropdown}
				onPress={() => toggleOpen(!isOpen)}
				activeOpacity={0.8}
			>
				<Text
					style={[styles.dropdownText, !currentValue && styles.placeholder]}
				>
					{currentValue || 'Выберите'}
				</Text>
				<Icon
					name={isOpen ? 'chevron-up' : 'chevron-down'}
					size={20}
					color='#fff'
				/>
			</TouchableOpacity>

			{isOpen && (
				<View style={styles.dropdownList}>
					<FlatList
						data={items}
						keyExtractor={(item, idx) => `${item}-${idx}`}
						renderItem={({ item }) => (
							<TouchableOpacity
								onPress={() => {
									onSelect(item)
									toggleOpen(false)
								}}
								style={styles.dropdownItem}
								activeOpacity={0.8}
							>
								<Text style={styles.dropdownText}>{item}</Text>
							</TouchableOpacity>
						)}
						nestedScrollEnabled
						style={{ maxHeight: 320 }}
						contentContainerStyle={{ paddingBottom: 4 }}
						keyboardShouldPersistTaps='handled'
					/>
				</View>
			)}
		</View>
	)

	if (successVisible) {
		return (
			<SuccessScreen
				title='Заявка принята'
				subtitle='Мы обрабатываем ваш запрос. Вывод средств будет выполнен в течение 3 рабочих дней.'
				buttonText='На главный экран'
				onPress={() =>
					navigation.reset({
						index: 0,
						routes: [
							{
								name: 'Tabs',
								state: { index: 0, routes: [{ name: 'Home' }] },
							},
						],
					})
				}
			/>
		)
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

			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
			>
				<SafeAreaView style={styles.safeArea}>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => navigation.goBack()}>
							<Icon name='arrow-back' size={24} color='#fff' />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>Вывод средств</Text>
						<View style={{ width: 24 }} />
					</View>

					<ScrollView contentContainerStyle={styles.scroll}>
						<Text style={styles.label}>Откуда</Text>

						<View style={styles.dropdownWrapper}>
							<TouchableOpacity
								style={styles.dropdown}
								onPress={() => setAccountDropdownOpen(!accountDropdownOpen)}
								activeOpacity={0.8}
							>
								<View style={{ flex: 1, paddingRight: 10 }}>
									<Text
										numberOfLines={1}
										ellipsizeMode='tail'
										style={[
											styles.dropdownText,
											!selectedAccount && styles.placeholder,
										]}
									>
										{selectedAccount
											? `${selectedAccount.holdingPlace.slice(
													0,
													20
											  )}... ${selectedAccount.freeAmount.toLocaleString(
													'ru-RU',
													{
														minimumFractionDigits: 2,
														maximumFractionDigits: 2,
													}
											  )} ${selectedAccount.currency}`
											: 'Выберите счёт'}
									</Text>
								</View>
								<Icon
									name={accountDropdownOpen ? 'chevron-up' : 'chevron-down'}
									size={20}
									color='#fff'
								/>
							</TouchableOpacity>

							{accountDropdownOpen && (
								<View style={styles.dropdownList}>
									<FlatList
										data={freeMoney || []}
										keyExtractor={(item, idx) => `${item.holdingPlace}-${idx}`}
										renderItem={({ item }) => (
											<TouchableOpacity
												onPress={() => {
													setSelectedAccount(item)
													setCurrency(item.currency)
													setAccountDropdownOpen(false)
												}}
												style={styles.dropdownItem}
												activeOpacity={0.8}
											>
												<Text style={styles.dropdownText}>
													{item.holdingPlace}{' '}
													{item.freeAmount.toLocaleString('ru-RU', {
														minimumFractionDigits: 2,
														maximumFractionDigits: 2,
													})}{' '}
													{item.currency}
												</Text>
											</TouchableOpacity>
										)}
										nestedScrollEnabled
										style={{ maxHeight: 300 }}
										contentContainerStyle={{ paddingBottom: 4 }}
									/>
								</View>
							)}
						</View>

						<Text style={styles.label}>Выберите банк</Text>
						{(() => {
							const userBanks: string[] = []

							if (user?.account) {
								if (user.account.bank?.name) {
									userBanks.push(user.account.bank.name)
								}
								if (user.account.foreignBank?.name) {
									userBanks.push(user.account.foreignBank.name)
								}
							}

							// const banksList = [...new Set([...userBanks, 'Другой банк'])]
							const banksList = [...new Set([...userBanks])]

							return banksList.length > 0 ? (
								renderDropdown(banksList, setBank, bank, bankDropdownOpen, () =>
									setBankDropdownOpen(!bankDropdownOpen)
								)
							) : (
								<Text style={[styles.dropdownText, styles.placeholder]}>
									Нет доступных банков
								</Text>
							)
						})()}

						{/* {bank === 'Другой банк' && (
							<>
								<FormInput
									label='Название банка'
									placeholder='Введите название банка'
									value={customBank}
									onChangeText={setCustomBank}
								/>
								<FormInput
									label='Номер счёта'
									placeholder='Введите номер счёта'
									keyboardType='default'
									value={accountNumber}
									onChangeText={setAccountNumber}
								/>
								<FormInput
									label='SWIFT'
									placeholder='Введите SWIFT код'
									value={swift}
									onChangeText={setSwift}
									required
								/>
							</>
						)} */}

						<View style={styles.sumInput}>
							<FormInput
								label='Сумма вывода'
								labelStyle={styles.sumInputLabel}
								placeholder='от 1000,00 ₸'
								keyboardType='numeric'
								value={amount}
								onChangeText={setAmount}
							/>
						</View>
					</ScrollView>

					<TouchableOpacity
						style={[styles.nextButton, !isFormValid && styles.disabled]}
						onPress={handleNext}
						disabled={!isFormValid}
					>
						<Text style={styles.nextButtonText}>
							{isLoadingSubmit ? 'Отправка...' : 'Подтвердить'}
						</Text>
					</TouchableOpacity>
				</SafeAreaView>
			</KeyboardAvoidingView>

			<SmsCodeModal
				visible={smsVisible}
				onClose={() => setSmsVisible(false)}
				onConfirm={requestSmsConfirm}
				onSuccess={handleConfirmWithdraw}
				onResend={() => sendSmsCode({ phone: user?.phone }).unwrap()}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	safeArea: { flex: 1, justifyContent: 'space-between' },
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.15)',
	},
	scroll: { padding: 20 },
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	headerTitle: {
		color: '#fff',
		fontSize: 16,
		fontFamily: 'Montserrat',
		fontWeight: '600',
	},
	label: {
		color: '#fff',
		marginBottom: 6,
		marginTop: 16,
		fontSize: 14,
	},
	dropdownWrapper: {
		marginBottom: 12,
		backgroundColor: 'rgba(255,255,255,0.1)',
		borderRadius: 10,
	},
	dropdown: {
		paddingVertical: 14,
		paddingHorizontal: 12,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	dropdownText: {
		color: '#fff',
		fontSize: 16,
		fontFamily: 'Montserrat',
	},
	placeholder: {
		color: '#999',
		fontFamily: 'Montserrat',
	},
	dropdownList: {
		overflow: 'hidden',
		borderBottomLeftRadius: 10,
		borderBottomRightRadius: 10,
		backgroundColor: 'rgba(255,255,255,0.01)',
	},
	dropdownItem: {
		paddingVertical: 14,
		paddingHorizontal: 12,
	},
	sumInput: { marginTop: 85 },
	sumInputLabel: { textAlign: 'center', fontFamily: 'Montserrat' },
	nextButton: {
		backgroundColor: '#fff',
		paddingVertical: 14,
		borderRadius: 30,
		alignItems: 'center',
		marginHorizontal: 20,
		marginBottom: 16,
	},
	nextButtonText: {
		color: '#00244D',
		fontSize: 16,
		fontWeight: 'bold',
		fontFamily: 'Montserrat',
	},
	disabled: { opacity: 0.5 },
})
