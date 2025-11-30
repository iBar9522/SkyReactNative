import { useGetHbOrdersByUserIdMutation } from '@/api/legacyAdapterApi'
import { useLazyGetReportsQuery } from '@/api/reportApi'
import { CustomCalendar } from '@/components/CustomCalendar'
import FormInput from '@/components/FormInput'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useMemo, useState } from 'react'
import {
	Keyboard,
	KeyboardAvoidingView,
	Modal,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native'
import RNFetchBlob from 'react-native-blob-util'
import RNFS from 'react-native-fs'
import LinearGradient from 'react-native-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import Icon from 'react-native-vector-icons/Ionicons'
import ReportCard from './ReportCard'
import { debounce } from 'lodash'

const onDemandReports = [
	{
		id: '1',
		title: 'Выписка на дату',
		subtitle: 'Финансовый отчёт',
		date: '',
		showArrow: true,
		fileSize: undefined,
	},
]

const monthNamesRu = [
	'Январь',
	'Февраль',
	'Март',
	'Апрель',
	'Май',
	'Июнь',
	'Июль',
	'Август',
	'Сентябрь',
	'Октябрь',
	'Ноябрь',
	'Декабрь',
]

const parseDdMmYyyy = (value?: string) => {
	if (!value) return null
	const p = value.split('/')
	if (p.length !== 3) return null
	const d = parseInt(p[0], 10)
	const m = parseInt(p[1], 10) - 1
	const y = parseInt(p[2], 10)
	const dt = new Date(y, m, d)
	return isNaN(dt.getTime()) ? null : dt
}

const formatDisplayRange = (from?: string, to?: string) => {
	const d1 = parseDdMmYyyy(from)
	const d2 = parseDdMmYyyy(to)
	if (!d1 || !d2) return 'Выберите период'
	const sameMonth =
		d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()
	const mm1 = monthNamesRu[d1.getMonth()]
	const mm2 = monthNamesRu[d2.getMonth()]
	const day1 = d1.getDate()
	const day2 = d2.getDate()
	const year = d2.getFullYear()
	if (sameMonth) return `${mm2} ${day1} - ${day2}, ${year}`
	return `${mm1} ${day1} - ${mm2} ${day2}, ${year}`
}

const Reports = () => {
	const [activeTab, setActiveTab] = useState('mandatory')
	const [searchQuery, setSearchQuery] = useState('')
	const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(
		null
	)
	const [filtersVisible, setFiltersVisible] = useState(false)
	const [reportType, setReportType] = useState<'deal' | 'monthly'>('deal')
	const [dateFrom, setDateFrom] = useState('')
	const [dateTo, setDateTo] = useState('')
	const [appliedFrom, setAppliedFrom] = useState<string | null>(null)
	const [appliedTo, setAppliedTo] = useState<string | null>(null)
	const [showRangeCalendar, setShowRangeCalendar] = useState(false)

	const filterReports = (reports: any[]) => {
		if (!searchQuery.trim()) return reports
		const query = searchQuery.toLowerCase().trim()
		return reports.filter(report => {
			const title = 'отчет по сделке'.toLowerCase()
			const ticker = (report.ticker || '').toLowerCase()
			return title.includes(query) || ticker.includes(query)
		})
	}

	const { user } = useAuth()
	const [getHbOrdersByUserId, { data }] = useGetHbOrdersByUserIdMutation()
	const [triggerGetReports] = useLazyGetReportsQuery()
	const navigation = useNavigation<any>()

	const handleDownload = async (order: any) => {
		if (downloadingOrderId === order.orderId) return

		setDownloadingOrderId(order.orderId)
		try {
			const payload = {
				userId: user?.oracleClientId,
				orderId: order.orderId,
			}

			const fileName = `report-${order.orderId}-${Date.now()}.pdf`
			const dirs = RNFetchBlob.fs.dirs
			const baseDir =
				Platform.OS === 'android'
					? dirs.DownloadDir || dirs.SDCardDir
					: dirs.DocumentDir
			const destPath = `${baseDir}/${fileName}`

			const apiResult = await triggerGetReports(payload).unwrap()
			if (!apiResult?.base64) throw new Error('Empty PDF')

			await RNFS.writeFile(destPath, apiResult.base64, 'base64')
			if (Platform.OS === 'ios') {
				RNFetchBlob.ios.openDocument(destPath)
			} else {
				RNFetchBlob.android.actionViewIntent(
					destPath,
					apiResult.contentType || 'application/pdf'
				)
			}

			Toast.show({
				type: 'success',
				text1: 'Отчет готов',
				text2: 'Открываем документ',
			})
		} catch (error) {
			console.error('Download error:', error)
			Toast.show({
				type: 'error',
				text1: 'Ошибка скачивания',
				text2: 'Попробуйте еще раз',
			})
		} finally {
			setDownloadingOrderId(null)
		}
	}

	const buildRequestBody = useMemo(() => {
		if (!user?.oracleClientId) return null

		const body: any = {
			userId: user?.oracleClientId,
			statusId: 4,
		}

		if (searchQuery.trim()) {
			body.search = searchQuery.trim()
		}

		if (appliedFrom && appliedTo) {
			const from = parseDdMmYyyy(appliedFrom)
			const to = parseDdMmYyyy(appliedTo)
			if (from && to) {
				body.begDate = from.toISOString().split('T')[0]
				body.endDate = to.toISOString().split('T')[0]
			}
		}

		return body
	}, [user?.oracleClientId, searchQuery, appliedFrom, appliedTo])

	const debouncedSearch = useMemo(
		() =>
			debounce(async (body: any) => {
				try {
					if (!body) return
					await getHbOrdersByUserId(body)
				} catch (e) {
					console.error('Ошибка при поиске:', e)
				}
			}, 500),
		[getHbOrdersByUserId]
	)

	useEffect(() => {
		const body = buildRequestBody
		if (body) debouncedSearch(body)
		return () => debouncedSearch.cancel()
	}, [buildRequestBody])

	useEffect(() => {
		if (user?.oracleClientId) {
			getHbOrdersByUserId({ userId: user?.oracleClientId, statusId: 4 })
		}
	}, [user?.oracleClientId])

	return (
		<SafeAreaView style={styles.container} edges={['left', 'right']}>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<KeyboardAvoidingView
					style={{ flex: 1 }}
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				>
					<LinearGradient
						colors={['#091F44', '#3376F6']}
						start={{ x: 0, y: 0 }}
						end={{ x: 0, y: 1 }}
						style={StyleSheet.absoluteFill}
					/>

					<View style={styles.header}>
						<TouchableOpacity
							style={styles.backButton}
							onPress={() => navigation.goBack()}
						>
							<Icon name='arrow-back' size={24} color='#fff' />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>Мои отчеты</Text>
						<View style={styles.headerSpacer} />
					</View>

					<View style={styles.tabBar}>
						<TouchableOpacity
							style={[
								styles.tab,
								activeTab === 'mandatory' && styles.activeTab,
							]}
							onPress={() => setActiveTab('mandatory')}
						>
							<Text
								style={[
									styles.tabText,
									activeTab === 'mandatory' && styles.activeTabText,
								]}
							>
								Обязательные
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.tab, activeTab === 'ondemand' && styles.activeTab]}
							onPress={() => setActiveTab('ondemand')}
						>
							<Text
								style={[
									styles.tabText,
									activeTab === 'ondemand' && styles.activeTabText,
								]}
							>
								По запросу
							</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.searchContainer}>
						<FormInput
							placeholder='Поиск'
							search
							isFilter
							onPressFilter={() => setFiltersVisible(true)}
							value={searchQuery}
							onChangeText={setSearchQuery}
						/>
					</View>

					<ScrollView
						style={styles.reportsList}
						showsVerticalScrollIndicator={false}
					>
						{activeTab === 'mandatory'
							? filterReports(data || [])?.map((report, index) => (
									<ReportCard
										key={index}
										title={'Отчет по сделке'}
										subtitle={report.ticker}
										fileSize={'1,1 MB'}
										date={report.orderDate}
										showArrow={false}
										onDownload={() => handleDownload(report)}
										isLoading={downloadingOrderId === report.orderId}
									/>
							  ))
							: onDemandReports.map((report, index) => (
									<ReportCard
										key={index}
										title={report.title}
										subtitle={report.subtitle}
										showArrow={report.showArrow}
									/>
							  ))}
					</ScrollView>

					<Modal
						visible={filtersVisible}
						transparent
						animationType='slide'
						onRequestClose={() => setFiltersVisible(false)}
						presentationStyle='overFullScreen'
						statusBarTranslucent
					>
						<TouchableWithoutFeedback onPress={() => setFiltersVisible(false)}>
							<View style={styles.modalRoot}>
								<View style={styles.modalBackdrop} />
								<TouchableWithoutFeedback>
									<View style={styles.sheet}>
										<View style={styles.sheetHandle} />
										<Text style={styles.sheetTitle}>Вид отчета</Text>

										<TouchableOpacity
											style={styles.radioRow}
											onPress={() => setReportType('deal')}
										>
											<View
												style={[
													styles.radio,
													reportType === 'deal' && styles.radioActive,
												]}
											/>
											<Text style={styles.radioText}>Отчет по сделке</Text>
										</TouchableOpacity>
										<TouchableOpacity
											style={styles.radioRow}
											onPress={() => setReportType('monthly')}
										>
											<View
												style={[
													styles.radio,
													reportType === 'monthly' && styles.radioActive,
												]}
											/>
											<Text style={styles.radioText}>Ежемесячный отчет</Text>
										</TouchableOpacity>

										<View style={{ height: 16 }} />
										<View style={styles.periodHeaderRow}>
											<Text style={styles.sheetTitle}>Период</Text>
											<TouchableOpacity
												onPress={() => {
													setDateFrom('')
													setDateTo('')
												}}
											>
												<Text style={styles.resetLink}>Сбросить</Text>
											</TouchableOpacity>
										</View>

										<TouchableOpacity
											activeOpacity={0.8}
											onPress={() => setShowRangeCalendar(true)}
											style={styles.periodSelect}
										>
											<Text style={styles.periodSelectText}>
												{formatDisplayRange(dateFrom, dateTo)}
											</Text>
											<Icon name={'chevron-down'} size={20} color={'#fff'} />
										</TouchableOpacity>

										<CustomCalendar
											value=''
											onChange={() => {}}
											isRangePicker={true}
											valueFrom={dateFrom}
											valueTo={dateTo}
											onRangeChange={(from, to) => {
												setDateFrom(from)
												setDateTo(to)
												setShowRangeCalendar(false)
											}}
											visible={showRangeCalendar}
											onClose={() => setShowRangeCalendar(false)}
										/>

										<View style={styles.sheetButtons}>
											<TouchableOpacity
												style={[styles.sheetButton, styles.sheetBtnSecondary]}
												onPress={() => {
													setReportType('deal')
													setDateFrom('')
													setDateTo('')
												}}
											>
												<Text style={styles.sheetBtnSecondaryText}>
													Сбросить
												</Text>
											</TouchableOpacity>
											<TouchableOpacity
												style={[styles.sheetButton, styles.sheetBtnPrimary]}
												onPress={() => {
													setAppliedFrom(dateFrom || null)
													setAppliedTo(dateTo || null)
													setFiltersVisible(false)
												}}
											>
												<Text style={styles.sheetBtnPrimaryText}>
													Применить
												</Text>
											</TouchableOpacity>
										</View>
									</View>
								</TouchableWithoutFeedback>
							</View>
						</TouchableWithoutFeedback>
					</Modal>
				</KeyboardAvoidingView>
			</TouchableWithoutFeedback>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		marginTop: 60,
		marginBottom: 20,
	},
	backButton: {
		padding: 8,
	},
	headerTitle: {
		flex: 1,
		fontSize: 18,
		fontWeight: '600',
		color: 'white',
		textAlign: 'center',
	},
	headerSpacer: {
		width: 40,
	},
	tabBar: {
		flexDirection: 'row',
		marginHorizontal: 20,
		marginBottom: 20,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderRadius: 25,
		padding: 4,
	},
	tab: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 20,
		alignItems: 'center',
	},
	activeTab: {
		backgroundColor: 'white',
	},
	tabText: {
		fontSize: 14,
		fontWeight: '500',
		color: 'rgba(255, 255, 255, 0.7)',
	},
	activeTabText: {
		color: '#091F44',
	},
	searchContainer: {
		paddingHorizontal: 20,
		marginBottom: 20,
		position: 'relative',
	},
	searchBar: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderRadius: 15,
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		color: 'white',
	},
	reportsList: {
		flex: 1,
		paddingHorizontal: 20,
	},
	filterButton: {
		position: 'absolute',
		right: 32,
		top: 10,
		padding: 8,
	},
	modalBackdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalRoot: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	sheet: {
		backgroundColor: '#2d3f5f',
		paddingHorizontal: 20,
		paddingTop: 12,
		paddingBottom: 24,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
	},
	sheetHandle: {
		alignSelf: 'center',
		width: 60,
		height: 4,
		borderRadius: 2,
		backgroundColor: 'rgba(255,255,255,0.5)',
		marginBottom: 16,
	},
	sheetTitle: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 12,
	},
	radioRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	radio: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: 'rgba(255,255,255,0.6)',
		marginRight: 12,
	},
	radioActive: {
		backgroundColor: '#fff',
		borderColor: '#fff',
	},
	radioText: {
		color: '#fff',
		fontSize: 16,
	},
	periodHeaderRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	resetLink: {
		color: '#C9D3E7',
		textDecorationLine: 'underline',
	},
	periodRow: {
		flexDirection: 'row',
		marginTop: 8,
	},
	periodRowExpanded: {
		flexDirection: 'row',
		marginTop: 12,
	},
	periodSelect: {
		marginTop: 8,
		backgroundColor: 'rgba(255, 255, 255, 0.12)',
		borderRadius: 16,
		paddingVertical: 14,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	periodSelectText: {
		color: '#fff',
		fontSize: 16,
	},
	sheetButtons: {
		flexDirection: 'row',
		marginTop: 20,
	},
	sheetButton: {
		flex: 1,
		borderRadius: 14,
		paddingVertical: 14,
		alignItems: 'center',
	},
	sheetBtnSecondary: {
		backgroundColor: 'rgba(255,255,255,0.15)',
		marginRight: 12,
	},
	sheetBtnSecondaryText: {
		color: '#C9D3E7',
		fontWeight: '600',
	},
	sheetBtnPrimary: {
		backgroundColor: '#fff',
		marginLeft: 12,
	},
	sheetBtnPrimaryText: {
		color: '#091F44',
		fontWeight: '700',
	},
	reportCard: {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderRadius: 15,
		marginBottom: 12,
		overflow: 'hidden',
	},
	reportContent: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
	},
	reportInfo: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	reportText: {
		flex: 1,
		marginLeft: 12,
	},
	reportTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: 'white',
		marginBottom: 4,
	},
	reportSubtitle: {
		fontSize: 14,
		color: 'rgba(255, 255, 255, 0.7)',
	},
	reportActions: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	fileSize: {
		fontSize: 14,
		color: 'rgba(255, 255, 255, 0.6)',
		marginRight: 12,
	},
	downloadButton: {
		padding: 8,
	},
	arrowButton: {
		padding: 8,
	},
	icon: {
		fontSize: 20,
		color: 'white',
	},
	leftArrowIcon: {
		width: 25,
		height: 20,
	},
})

export default Reports
