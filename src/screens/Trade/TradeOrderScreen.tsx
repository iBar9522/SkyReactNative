import {
	useAddBuySellOrderDirectusMutation,
	useAddMtoDirectusMutation,
	useCreateHbOrderMutation,
	useCreateHbPutMtoMutation,
	useGetCurrencyRateMutation,
	useGetHbFreeMoneyByUserIdMutation,
} from '@/api/legacyAdapterApi'
import {
	useSendSmsCodeMutation,
	useVerifyCodeMutation,
} from '@/api/notificationsApi'
import Button from '@/components/Button'
import FormInput from '@/components/FormInput'
import Select from '@/components/Select'
import SmsCodeModal from '@/components/SmsCodeModal'
import SuccessScreen from '@/components/SuccessScreen'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'
import debounce from 'lodash/debounce'
import React, { useEffect, useMemo, useState } from 'react'
import {
	Image,
	LayoutAnimation,
	Platform,
	SafeAreaView,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	UIManager,
	View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'
import OrderDatePicker from './components/OrderDatePicker'
import Toast from 'react-native-toast-message'
import RebalanceModal from './components/RebalanceModal'
import { HbPutMtoRequest } from '@/types/LegacyAdapterTypes'
import { getCurrencySymbol } from '@/utils/formats'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = {
	route: {
		params: {
			asset: any
			mode: 'buy' | 'sell'
		}
	}
}

type FreeMoneyItem = {
	ftId: number
	currency: string
	currencyName?: string
	freeAmount: number
	blockedAmount?: number
	holdingPlace?: string
	subAccount?: string
	iban?: string
}

type RebalanceCheckResult =
	| { type: 'none' } // хватает на одном счёте
	| { type: 'rebalance' } // ребаланс внутри валюты
	| { type: 'rebalanceWithConversion' } // ребаланс с конвертацией
	| { type: 'topup' }

const orderTypes = ['Лимитированная', 'Рыночная']

const ORDER_TYPE_MAP: Record<string, number> = {
	Лимитированная: 1,
	Рыночная: 2,
}

const TradeOrderScreen = ({ route }: Props) => {
	const { asset, mode } = route.params
	const insets = useSafeAreaInsets()

	const navigation = useNavigation<any>()
	const [priceInput, setPriceInput] = useState(String(asset?.pricePaper))
	const [orderType, setOrderType] = useState<string | null>(null)
	const [commission, setCommission] = useState(0)
	const [step, setStep] = useState(1)

	const [selectedDate, setSelectedDate] = useState(new Date())
	const [tempDate, setTempDate] = useState(new Date())
	const [showDatePicker, setShowDatePicker] = useState(false)
	const [smsVisible, setSmsVisible] = useState(false)
	const [successVisible, setSuccessVisible] = useState(false)

	const price = useMemo(() => {
		const n = parseFloat(priceInput.replace(',', '.'))
		return Number.isFinite(n) ? n : 0
	}, [priceInput])
	const [quantityInput, setQuantityInput] = useState('2')
	const quantity = useMemo(() => {
		const n = parseInt(quantityInput, 10)
		return Number.isFinite(n) ? n : 0
	}, [quantityInput])

	const [total, setTotal] = useState((price * quantity).toFixed(2))

	const [rebalanceVisible, setRebalanceVisible] = useState(false)
	const [rebalanceInfoVisible, setRebalanceInfoVisible] = useState(false)

	const { user } = useAuth()
	const [createHbOrder, { isLoading: isCreatingOrder }] =
		useCreateHbOrderMutation()
	const [createPutMto, { isLoading: isCreatingPutMto }] =
		useCreateHbPutMtoMutation()
	const [sendSmsCode] = useSendSmsCodeMutation()
	const [verifyCode] = useVerifyCodeMutation()

	const amount = useMemo(() => price * quantity, [price, quantity])

	const [
		getHbFreeMoneyByUserId,
		{ data: freeMoney, isLoading: freeMoneyLoading },
	] = useGetHbFreeMoneyByUserIdMutation()

	const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null)

	const groupedMoney = useMemo(() => {
		if (!freeMoney) return []

		const map = new Map()

		for (const item of freeMoney) {
			const key = item.currency
			const existing = map.get(key)

			if (existing) {
				existing.freeAmount += item.freeAmount ?? 0
				existing.blockedAmount += item.blockedAmount ?? 0
				existing.ftIds.push(item.ftId)
				existing.holdingPlaces.push(item.holdingPlace)
			} else {
				map.set(key, {
					currency: item.currency,
					currencyName: item.currencyName,
					freeAmount: item.freeAmount ?? 0,
					blockedAmount: item.blockedAmount ?? 0,
					ftIds: [item.ftId],
					holdingPlaces: [item.holdingPlace],
				})
			}
		}

		return Array.from(map.values())
	}, [freeMoney])

	const currencies = groupedMoney.map(item => ({
		value: item.currency,
		label: `${item.currencyName.toUpperCase()} (${item.currency.toUpperCase()})`,
	}))

	const [getCurrencyRate] = useGetCurrencyRateMutation()
	const [exchangeRate, setExchangeRate] = useState<number | null>(null)

	const [addBuySellOrderDirectus, { isLoading: isAddingDirectusOrder }] =
		useAddBuySellOrderDirectusMutation()
	const [addMtoDirectus, { isLoading: isAddingMto }] =
		useAddMtoDirectusMutation()

	const currentCurrencyObj =
		groupedMoney.find(item => item.currency === selectedCurrency) ??
		groupedMoney[0]

	const freeAmount = currentCurrencyObj?.freeAmount ?? 0
	const currency = currentCurrencyObj?.currency ?? ''

	useEffect(() => {
		if (user?.oracleClientId) {
			getHbFreeMoneyByUserId({ userId: user?.oracleClientId })
		}
	}, [user?.oracleClientId])

	useEffect(() => {
		setTotal(amount.toFixed(2))
	}, [amount])

	if (Platform.OS === 'android') {
		UIManager.setLayoutAnimationEnabledExperimental?.(true)
	}
	useEffect(() => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
	}, [step])

	useEffect(() => {
		const updateRates = async () => {
			if (!selectedCurrency || !asset?.exchange?.currency) return

			const rate = await fetchExchangeRate(
				asset.exchange.currency,
				selectedCurrency
			)
			if (rate && rate !== 1) {
				const convertedPrice = price * rate
				setPriceInput(convertedPrice.toFixed(2))

				const convertedCommission = commission * rate
				setCommission(convertedCommission)

				const convertedTotal = amount * rate
				setTotal(convertedTotal.toFixed(2))
			}
		}

		updateRates()
	}, [selectedCurrency])

	useEffect(() => {
		if (price > 0 && quantity > 0 && currency) {
			triggerCommission(price, quantity)
		}
	}, [currency, orderType])

	const fetchExchangeRate = async (from: string, to: string) => {
		try {
			if (from === to) {
				setExchangeRate(1)
				return 1
			}

			const startDate = '2025-04-24'
			const endDate = '2025-06-29'
			const res = await getCurrencyRate({
				fromCurrencyCode: from,
				toCurrencyCode: to,
				startDate: startDate,
				endDate: endDate,
			}).unwrap()

			const rate = res?.[0]?.exchangeRate ?? 1
			setExchangeRate(rate)
			return rate
		} catch (e) {
			console.error('Ошибка при получении курса валют:', e)
			setExchangeRate(1)
			return 1
		}
	}

	function checkRebalanceNeed(
		mode: 'buy' | 'sell',
		amount: number,
		freeMoney: FreeMoneyItem[],
		selectedCurrency: string | null,
		assetCurrency: string
	): RebalanceCheckResult {
		if (mode !== 'buy') return { type: 'none' }
		if (!freeMoney || freeMoney.length === 0) return { type: 'topup' }

		const targetCurrency = selectedCurrency || assetCurrency || 'USD'
		const sameCurrencyAccounts = freeMoney.filter(
			a => a.currency === targetCurrency
		)

		// Проверяем хватает ли на одном счёте
		const hasEnoughOnAnyAccount = sameCurrencyAccounts.some(
			acc => (acc.freeAmount ?? 0) >= amount
		)
		if (hasEnoughOnAnyAccount) return { type: 'none' }

		// Проверяем хватает ли суммарно в этой валюте
		const totalInCurrency = sameCurrencyAccounts.reduce(
			(sum, acc) => sum + (acc.freeAmount ?? 0),
			0
		)
		if (totalInCurrency >= amount) {
			return { type: 'rebalance' }
		}

		// Не хватает даже суммарно в валюте — значит пополнение
		return { type: 'topup' }
	}

	const grandTotal = useMemo(() => {
		const rate = exchangeRate ?? 1
		return ((parseFloat(total) + commission) * rate).toFixed(2)
	}, [total, commission, exchangeRate])

	const requestSmsConfirm = async (code: string) => {
		return await verifyCode({ target: user?.phone, code }).unwrap()
	}

	const handleBuyClick = async () => {
		try {
			const check = checkRebalanceNeed(
				mode,
				amount,
				freeMoney ?? [],
				selectedCurrency,
				asset?.exchange?.currency
			)

			switch (check.type) {
				case 'none':
					setSmsVisible(true)
					break

				case 'rebalance':
					setRebalanceVisible(true)
					break

				case 'topup':
					navigation.navigate('FundAccount')
					break
			}
		} catch (e) {
			console.error('Ошибка при проверке счетов:', e)
		}
	}

	const buildOrderPayload = (
		priceValue: number,
		quantityValue: number,
		extra: Record<string, any> = {}
	) => {
		return {
			p_userId: user?.oracleClientId,
			vORDER_DATE: new Date().toISOString().split('T')[0],
			vORDER_TYPE_ID: ORDER_TYPE_MAP[orderType],
			vDEAL_KIND_ID: mode === 'buy' ? 1 : 2,
			vISIN: asset?.isin,
			vTICKER: asset?.symbol,
			vQUANTITY: Math.max(1, quantityValue),
			vPRICE: priceValue,
			vDURATION: selectedDate.toISOString().split('T')[0],
			vAmount: +(priceValue * quantityValue).toFixed(2),
			vSignOrderBody: '<SignedOrderBody>...</SignedOrderBody>', // мок
			vCurrency: currency || asset?.exchange?.currency || 'USD',
			vBONDMARKETID: 321, // мок AIX
			vMTOSenderID: 1, // мок
			aCREATE_WITH_BOOL: 1, // мок
			vSigned_By_SMS_Bool: 1, // мок
			...extra,
		}
	}

	function computeRebalanceTransfers(
		freeMoney: FreeMoneyItem[],
		needed: number,
		targetCurrency: string
	) {
		if (!freeMoney?.length) return []

		let remaining = needed
		const transfers = []

		let target = freeMoney.find(
			a =>
				a.currency === targetCurrency &&
				a.holdingPlace?.toLowerCase().includes('центральный депозитарий')
		)

		if (!target) {
			target = freeMoney.find(a => a.currency === targetCurrency)
		}

		const sameCurrencySources = freeMoney
			.filter(a => a.currency === targetCurrency && a.ftId !== target?.ftId)
			.sort((a, b) => (b.freeAmount ?? 0) - (a.freeAmount ?? 0))

		for (const src of sameCurrencySources) {
			if (remaining <= 0) break
			const take = Math.min(src.freeAmount ?? 0, remaining)
			if (take > 0) {
				transfers.push({
					fromFt: src.ftId,
					toFt: target?.ftId,
					currency: src.currency,
					amount: take,
					subAccount: src.subAccount,
					iban: src.iban,
					conversionNeeded: false,
				})
				remaining -= take
			}
		}

		if (remaining > 0) {
			const otherCurrencySources = freeMoney
				.filter(a => a.currency !== targetCurrency)
				.sort((a, b) => (b.freeAmount ?? 0) - (a.freeAmount ?? 0))

			for (const src of otherCurrencySources) {
				if (remaining <= 0) break
				const take = Math.min(src.freeAmount ?? 0, remaining)
				if (take > 0) {
					transfers.push({
						fromFt: src.ftId,
						toFt: target?.ftId,
						currency: src.currency,
						amount: take,
						subAccount: src.subAccount,
						iban: src.iban,
						conversionNeeded: true,
					})
					remaining -= take
				}
			}
		}

		return transfers
	}

	const handleSubmitOrder = async () => {
		try {
			if (!orderType || !ORDER_TYPE_MAP[orderType]) {
				Toast.show({
					type: 'error',
					text1: 'Выберите тип заявки',
				})
				return
			}

			const orderData = buildOrderPayload(price, quantity)

			const check = checkRebalanceNeed(
				mode,
				amount,
				freeMoney ?? [],
				selectedCurrency,
				asset?.exchange?.currency
			)

			if (
				check.type === 'rebalance' ||
				check.type === 'rebalanceWithConversion'
			) {
				const directusOrder = await addBuySellOrderDirectus({
					data: orderData,
					pending_money_transfer: true,
				}).unwrap()

				const buySellOrderId = Number(directusOrder)
				if (!buySellOrderId) throw new Error('buySellOrderId не получен')

				const transfers = computeRebalanceTransfers(
					freeMoney ?? [],
					amount,
					selectedCurrency || 'USD'
				)

				if (transfers.length === 1) {
					const t = transfers[0]
					const hbPutPayload: HbPutMtoRequest = {
						p_userId: user?.oracleClientId ?? 0,
						vMTO_Date: new Date().toISOString(),
						vCurrency: t.currency,
						vAmount: Number(t.amount.toFixed(2)),
						vFT_ID: t.fromFt,
						vTo_FT_ID: t.toFt,
						vRecipient: 'АО "ЦД ЦБ"',
						vRecipientBank: 'АО "Народный Банк Казахстана"',
						vBik: 'HSBKKZKX',
						vRecipientTprn: t.subAccount,
						vRecipientIic: t.iban ?? t.subAccount,
						vCardAccount: 'KZ987654321098765432',
						vKbe: '17',
						vKnp: '171',
						vSwiftRecipientBank: 'HSBKKZKX',
						vCorrAcc: 'KZ123456789012345678',
						vCorrBank: 'АО "Народный Банк Казахстана"',
						vSwiftCorrBank: 'HSBKKZKX',
						vSignOrderBody: '<SignedOrderBody>...</SignedOrderBody>',
						vMTOSenderID: 1,
						vSigned_By_SMS_Bool: 1,
					}

					await createPutMto({
						buySellOrderId,
						body: hbPutPayload,
					}).unwrap()
				} else {
					for (const t of transfers) {
						const hbPutPayload: HbPutMtoRequest = {
							p_userId: user?.oracleClientId ?? 0,
							vMTO_Date: new Date().toISOString(),
							vCurrency: t.currency,
							vAmount: Number(t.amount.toFixed(2)),
							vFT_ID: t.fromFt,
							vTo_FT_ID: t.toFt,
							vRecipient: 'АО "ЦД ЦБ"',
							vRecipientBank: 'АО "Народный Банк Казахстана"',
							vBik: 'HSBKKZKX',
							vRecipientTprn: t.subAccount,
							vRecipientIic: t.iban ?? t.subAccount,
							vCardAccount: 'KZ987654321098765432',
							vKbe: '17',
							vKnp: '171',
							vSwiftRecipientBank: 'HSBKKZKX',
							vCorrAcc: 'KZ123456789012345678',
							vCorrBank: 'АО "Народный Банк Казахстана"',
							vSwiftCorrBank: 'HSBKKZKX',
							vSignOrderBody: '<SignedOrderBody>...</SignedOrderBody>',
							vMTOSenderID: 1,
							vSigned_By_SMS_Bool: 1,
						}

						await createPutMto({
							buySellOrderId,
							body: hbPutPayload,
						}).unwrap()
					}
				}
			} else {
				await createHbOrder(orderData).unwrap()
			}

			Toast.show({ type: 'success', text1: 'Заявка успешно создана' })
			setSuccessVisible(true)
		} catch (e) {
			console.error('Ошибка при создании ордера:', e)
			Toast.show({ type: 'error', text1: 'Ошибка при создании ордера' })
		}
	}

	const fetchCommission = async (priceValue: number, quantityValue: number) => {
		try {
			if (!orderType || !ORDER_TYPE_MAP[orderType]) return

			const payload = buildOrderPayload(priceValue, quantityValue, {
				vReturnCommissions: 1,
			})

			const response = await createHbOrder(payload).unwrap()

			let commissionValue = 0
			if (response?.v_result) {
				const match = String(response.v_result).match(
					/COMMISSIONS[.:]*\s*(\d+(\.\d+)?)/i
				)
				if (match) {
					commissionValue = parseFloat(match[1])
				}
			}

			const rate = exchangeRate ?? 1
			setCommission(commissionValue * rate)
		} catch (e) {
			console.error('Ошибка при расчёте комиссии:', e)
		}
	}

	const debouncedFetchCommission = useMemo(
		() =>
			debounce((priceValue: number, quantityValue: number) => {
				fetchCommission(priceValue, quantityValue)
			}, 500),
		[quantity, orderType, selectedDate]
	)

	const triggerCommission = (priceValue: number, quantityValue: number) => {
		if (priceValue > 0 && quantityValue > 0) {
			debouncedFetchCommission(priceValue, quantityValue)
		}
	}

	const handleOrderTypeSelect = (type: string) => {
		setOrderType(type)
		setStep(2)
	}

	const handleDatePickerCancel = () => {
		setTempDate(selectedDate)
		setShowDatePicker(false)
	}

	const handleDatePickerDone = () => {
		setSelectedDate(tempDate)
		setShowDatePicker(false)
	}

	const onDateChange = (_event: any, date?: Date) => {
		if (date) {
			setTempDate(date)
		}
	}

	const handlePriceChange = (text: string) => {
		const cleaned = text.replace(/[^0-9.,]/g, '')
		setPriceInput(cleaned)

		const n = parseFloat(cleaned.replace(',', '.'))
		if (!isNaN(n)) {
			triggerCommission(n, quantity)
		}
	}

	const handleQuantityChange = (text: string) => {
		const cleaned = text.replace(/[^\d]/g, '')
		setQuantityInput(cleaned)

		const n = parseInt(cleaned, 10)
		if (!isNaN(n)) {
			triggerCommission(price, n)
		}
	}

	const dec = () => {
		setQuantityInput(prev => {
			const newVal = Math.max(1, parseInt(prev || '1', 10) - 1)
			triggerCommission(price, newVal)
			return String(newVal)
		})
	}

	const inc = () => {
		setQuantityInput(prev => {
			const newVal = parseInt(prev || '0', 10) + 1
			triggerCommission(price, newVal)
			return String(newVal)
		})
	}

	const decPrice = () =>
		setPriceInput(prev => {
			const n = parseFloat(prev.replace(',', '.')) || 0
			const newVal = Math.max(0, n - 1)
			triggerCommission(newVal, quantity)
			return newVal.toFixed(2)
		})

	const incPrice = () =>
		setPriceInput(prev => {
			const n = parseFloat(prev.replace(',', '.')) || 0
			const newVal = n + 1
			triggerCommission(newVal, quantity)
			return newVal.toFixed(2)
		})

	const getPriceLabel = () => {
		if (orderType === 'Условная') {
			return mode === 'buy' ? 'Цена не дороже' : 'Цена не дешевле'
		}
		return 'Цена'
	}

	const getPricePlaceholder = () => {
		if (orderType === 'Рыночная') return 'По текущему рынку'
		return '0.00'
	}

	const isPriceDisabled = orderType === 'Рыночная'

	const isSubmitting =
		isCreatingOrder || isAddingDirectusOrder || isAddingMto || isCreatingPutMto

	if (successVisible) {
		return (
			<SuccessScreen
				title='Ваша заявка успешно создана'
				subtitle='Спасибо! Мы обработаем её в ближайшее время.'
				buttonText='Вернуться'
				onPress={() => navigation.goBack()}
			/>
		)
	}

	return (
		<View style={styles.screenBg}>
			<StatusBar barStyle='light-content' />
			<LinearGradient
				colors={['#091F44', '#3376F6']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				style={StyleSheet.absoluteFill}
			/>
			<View style={styles.overlay} />

			<SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
				<View style={styles.header}>
					<TouchableOpacity
						style={styles.backBtn}
						onPress={() => navigation.goBack()}
					>
						<Icon name='arrow-back' size={24} color='#fff' />
					</TouchableOpacity>
					<Text style={styles.title}>
						{mode == 'buy' ? 'Купить ценные бумаги' : 'Продать ценные бумаги'}
					</Text>
					<View style={{ width: 22 }} />
				</View>

				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					<View style={{ marginBottom: 16 }}>
						<Text style={styles.free_label}>Валюта счёта</Text>
						<Select<string>
							value={selectedCurrency || currencies[0]?.value}
							placeholder='Валюта'
							options={currencies}
							onSelect={value => setSelectedCurrency(value)}
						/>
					</View>

					<View>
						<Text style={styles.free_label}>Свободные средства</Text>
						<FormInput
							value={
								freeMoneyLoading
									? 'Загрузка...'
									: `${freeAmount.toLocaleString('ru-RU', {
											minimumFractionDigits: 2,
									  })} ${getCurrencySymbol(currency)}`
							}
							disabled
						/>
					</View>

					<View style={styles.ideaHeader}>
						<View style={styles.logoCircle}>
							<Image source={asset?.logo} style={styles.logoImage} />
						</View>

						<View style={styles.ideaInfo}>
							<Text style={styles.ideaTitle}>{asset?.name}</Text>
							<Text style={styles.ideaDate}>
								{(asset?.pricePaper * (exchangeRate ?? 1)).toLocaleString(
									'ru-RU',
									{
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									}
								)}{' '}
								{getCurrencySymbol(
									selectedCurrency || asset?.exchange?.currency
								)}
							</Text>
						</View>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Тип заявки</Text>
						<Select<string>
							value={orderType}
							placeholder='Выберите тип заявки'
							options={orderTypes.map(type => ({ value: type, label: type }))}
							onSelect={handleOrderTypeSelect}
							skipFirstOptionInDropdown
						/>
					</View>

					{orderType && (
						<>
							<View style={styles.inputContainer}>
								{orderType !== 'Рыночная' && (
									<TouchableOpacity
										style={styles.roundButtonMinus}
										onPress={decPrice}
									>
										<Image
											source={require('@/assets/minus-icon.png')}
											style={styles.roundIcon}
										/>
									</TouchableOpacity>
								)}

								<FormInput
									label={getPriceLabel()}
									value={
										orderType === 'Рыночная' ? 'По текущему рынку' : priceInput
									}
									onChangeText={handlePriceChange}
									onBlur={() => {
										if (priceInput === '') setPriceInput('0.00')
									}}
									keyboardType='decimal-pad'
									textAlign='center'
									style={styles.inputWithSideButtons}
									placeholder={getPricePlaceholder()}
									disabled={orderType === 'Рыночная'}
								/>

								{orderType !== 'Рыночная' && (
									<TouchableOpacity
										style={styles.roundButtonPlus}
										onPress={incPrice}
									>
										<Image
											source={require('@/assets/plus-icon.png')}
											style={styles.roundIcon}
										/>
									</TouchableOpacity>
								)}
							</View>

							<View style={styles.inputContainer}>
								<TouchableOpacity style={styles.roundButtonMinus} onPress={dec}>
									<Image
										source={require('@/assets/minus-icon.png')}
										style={styles.roundIcon}
									/>
								</TouchableOpacity>

								<FormInput
									value={quantityInput}
									onChangeText={handleQuantityChange}
									onBlur={() => {
										if (quantityInput === '') setQuantityInput('1')
									}}
									keyboardType='number-pad'
									textAlign='center'
									style={styles.inputWithSideButtons}
									label='Количество'
								/>

								<TouchableOpacity style={styles.roundButtonPlus} onPress={inc}>
									<Image
										source={require('@/assets/plus-icon.png')}
										style={styles.roundIcon}
									/>
								</TouchableOpacity>
							</View>

							{/* <View style={styles.formGroup}> */}
							{/* <Text style={styles.label}>Процент от суммы</Text> */}
							{/* <Slider
							minimumValue={0}
							maximumValue={100}
							value={20}
							step={1}
							minimumTrackTintColor='#007AFF'
							maximumTrackTintColor='rgba(255, 255, 255, 0.2)'
						/> */}
							{/* </View> */}

							<View style={styles.formGroup}>
								<Text style={styles.label}>Срок действия</Text>
								<TouchableOpacity
									style={styles.durationContainer}
									onPress={() => setShowDatePicker(true)}
								>
									<Text style={styles.durationText}>
										{selectedDate
											? selectedDate.toLocaleDateString('ru-RU', {
													day: '2-digit',
													month: '2-digit',
													year: 'numeric',
											  })
											: 'Выберите дату'}
									</Text>

									<Image
										source={require('@/assets/calendar-icon.png')}
										style={styles.calendarIcon}
									/>
								</TouchableOpacity>
							</View>

							<Text style={styles.commissionText}>
								Комиссия: {commission.toFixed(2)} {getCurrencySymbol(currency)}
							</Text>

							<View style={styles.totalContainer}>
								<Text style={styles.totalLabel}>
									Сумма ({getCurrencySymbol(currency)}):
								</Text>
								<FormInput
									value={`${grandTotal} ${getCurrencySymbol(currency)}`}
									keyboardType='decimal-pad'
									textAlign='center'
									style={styles.totalAmount}
									disabled
								/>
							</View>
						</>
					)}
				</ScrollView>
				<View style={[styles.footer]}>
					<Button
						title={mode == 'buy' ? 'Купить' : 'Продать'}
						icon={require('@/assets/import.png')}
						onPress={handleBuyClick}
						style={styles.buyButton}
						textSize={16}
						loading={isSubmitting}
					/>
					{mode == 'buy' && (
						<Button
							title='Как пополнить счет?'
							onPress={() => {
								navigation.navigate('FundAccount')
							}}
							style={styles.topUpButton}
							textStyle={{ color: '#fff' }}
							textSize={16}
						/>
					)}
				</View>
			</SafeAreaView>

			{/* <OrderTypePicker
				visible={isModalVisible}
				setVisible={setModalVisible}
				orderType={orderType}
				setOrderType={setOrderType}
			/> */}

			<OrderDatePicker
				visible={showDatePicker}
				selectedDate={selectedDate}
				tempDate={tempDate}
				setTempDate={setTempDate}
				onCancel={handleDatePickerCancel}
				onConfirm={handleDatePickerDone}
				onDateChange={onDateChange}
			/>

			<SmsCodeModal
				visible={smsVisible}
				onClose={() => setSmsVisible(false)}
				onConfirm={requestSmsConfirm}
				onSuccess={handleSubmitOrder}
				onResend={() => sendSmsCode({ phone: user?.phone }).unwrap()}
			/>

			<RebalanceModal
				type='confirm'
				visible={rebalanceVisible}
				onConfirm={async () => {
					setRebalanceVisible(false)
					setRebalanceInfoVisible(true)
				}}
				onCancel={() => setRebalanceVisible(false)}
			/>

			<RebalanceModal
				type='info'
				visible={rebalanceInfoVisible}
				onCancel={async () => {
					setRebalanceInfoVisible(false)
					await sendSmsCode({ phone: user?.phone }).unwrap()
					setSmsVisible(true)
					// await handleSubmitOrder()
				}}
			/>
		</View>
	)
}

export default TradeOrderScreen

const styles = StyleSheet.create({
	screenBg: { flex: 1, backgroundColor: '#0e1b36', padding: 16 },
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.12)',
	},
	safe: { flex: 1 },
	header: {
		height: 56,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	backBtn: { padding: 4 },
	leftArrowIcon: { width: 22, height: 18, resizeMode: 'contain' },
	title: { fontSize: 16, color: '#fff', fontWeight: '600' },
	footer: {
		paddingHorizontal: 16,
		paddingBottom: 24,
		paddingTop: 12,
	},
	scrollContent: {},
	content: { paddingBottom: 24 },
	free_label: {
		color: 'rgba(250, 250, 250, 1)',
		fontSize: 12,
		marginBottom: 6,
		marginLeft: 4,
	},
	ideaHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	logoCircle: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
	},
	logoImage: { width: 28, height: 28, resizeMode: 'contain' },
	ideaInfo: { flex: 1, marginLeft: 16 },
	ideaTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
	ideaDate: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
	formGroup: { marginBottom: 20 },
	label: { color: 'rgba(250, 250, 250, 0.8)', fontSize: 14, marginBottom: 8 },
	selectContainer: {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)',
	},
	selectText: { color: '#fff', fontSize: 16 },
	chevronIcon: { width: 20, height: 20, tintColor: '#fff' },
	inputContainer: {
		position: 'relative',
		justifyContent: 'center',
	},
	inputWithSideButtons: {
		paddingLeft: 44,
		paddingRight: 44,
	},
	roundButtonBase: {
		position: 'absolute',
		top: '50%',
		transform: [{ translateY: -12 }],
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 3,
		elevation: 3,
	},

	roundButtonMinus: {
		left: 6,
		...StyleSheet.flatten({
			position: 'absolute',
			top: '50%',
			transform: [{ translateY: -12 }],
			width: 32,
			height: 32,
			alignItems: 'center',
			justifyContent: 'center',
			zIndex: 3,
			elevation: 3,
		}),
	},

	roundButtonPlus: {
		right: 6,
		...StyleSheet.flatten({
			position: 'absolute',
			top: '50%',
			transform: [{ translateY: -12 }],
			width: 32,
			height: 32,
			alignItems: 'center',
			justifyContent: 'center',
			zIndex: 3,
			elevation: 3,
		}),
	},
	roundIcon: {
		width: 24,
		height: 24,
	},
	durationContainer: {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		flexDirection: 'row',
		justifyContent: 'space-between',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)',
	},
	durationText: { color: '#fff', fontSize: 16 },
	calendarIcon: { width: 20, height: 20, tintColor: '#fff' },
	commissionText: {
		color: 'rgba(255, 255, 255, 0.8)',
		fontSize: 14,
		textAlign: 'center',
		marginBottom: 16,
	},
	totalContainer: { alignItems: 'center', marginBottom: 24 },
	totalLabel: {
		color: 'rgba(255, 255, 255, 0.8)',
		fontSize: 16,
		marginTop: 20,
	},
	totalAmount: {
		width: 250,
		marginBottom: 16,
		color: '#fff',
		fontSize: 24,
		fontWeight: '600',
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderRadius: 8,
		paddingHorizontal: 24,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)',
	},
	buyButton: {
		flex: 0,
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingVertical: 16,
		marginBottom: 16,
		alignItems: 'center',
	},
	topUpButton: {
		flex: 0,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.3)',
		backgroundColor: 'transparent',
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
	},
	modalOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,0.6)',
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 999,
	},
	modalBox: {
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 24,
		width: '85%',
		alignItems: 'center',
	},
	modalTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#000',
		textAlign: 'center',
		marginBottom: 12,
	},
	modalText: {
		fontSize: 14,
		color: '#333',
		textAlign: 'center',
		marginBottom: 24,
		lineHeight: 20,
	},
	modalBtnPrimary: {
		backgroundColor: '#3376F6',
		borderRadius: 10,
		paddingVertical: 12,
		width: '100%',
		marginBottom: 8,
	},
	modalBtnSecondary: {
		backgroundColor: '#E9ECF5',
		borderRadius: 10,
		paddingVertical: 12,
		width: '100%',
		marginBottom: 8,
	},
	modalCancel: {
		backgroundColor: 'transparent',
		borderRadius: 10,
		paddingVertical: 12,
		width: '100%',
	},
})
