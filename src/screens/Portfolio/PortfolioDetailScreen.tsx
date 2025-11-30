import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useMemo, useState, useEffect } from 'react'
import {
	ActivityIndicator,
	Dimensions,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/Ionicons'

import {
	useGetSnapshotsTodayQuery,
	useGetStockHistoryByIsinQuery,
	useGetStockIntervalsQuery,
} from '@/api/marketsApi'
import { useGetHbDealsByUserIdMutation } from '@/api/legacyAdapterApi'
import FormInput from '@/components/FormInput'
import QualificationRequired from '@/components/QualificationRequired'
import { useAuth } from '@/contexts/AuthContext'
import { IntervalCandle, IntervalSize } from '@/types/MarketsTypes'
import { normalizeDateTime } from '@/utils/formats'
import TradeCard from '../Trade/TradeCard'
import StockChart from '../Trade/components/StockChart'

const screenWidth = Dimensions.get('window').width

type RangeKey = '1D' | '1W' | '1M' | '6M' | '1Y'

const toISO = (d: Date) =>
	`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
		d.getDate()
	).padStart(2, '0')}`

export function buildParamsForRange(range: RangeKey): {
	intervalSize: IntervalSize
	startDate?: string
	endDate?: string
	pageSize?: number
} {
	const now = new Date()
	const end = toISO(now)

	const clone = (d: Date) => new Date(d.getTime())

	switch (range) {
		case '1D': {
			const start = clone(now)
			start.setDate(now.getDate() - 1)
			return {
				intervalSize: '1h',
				startDate: toISO(start),
				endDate: end,
				pageSize: 500,
			}
		}
		case '1W': {
			const start = clone(now)
			start.setDate(now.getDate() - 7)
			return {
				intervalSize: '5m',
				startDate: toISO(start),
				endDate: end,
				pageSize: 500,
			}
		}
		case '1M': {
			const start = clone(now)
			start.setMonth(now.getMonth() - 1)
			return {
				intervalSize: '15m',
				startDate: toISO(start),
				endDate: end,
				pageSize: 500,
			}
		}
		case '6M': {
			const start = clone(now)
			start.setMonth(now.getMonth() - 6)
			return {
				intervalSize: '1h',
				startDate: toISO(start),
				endDate: end,
				pageSize: 1000,
			}
		}
		case '1Y': {
			const start = clone(now)
			start.setFullYear(now.getFullYear() - 1)
			return {
				intervalSize: '1h',
				startDate: toISO(start),
				endDate: end,
				pageSize: 1000,
			}
		}
		default:
			return { intervalSize: '1h', pageSize: 1000 }
	}
}

type Props = {
	route: {
		params: {
			item: {
				id: string
				title: string
				symbol: string
				price: number
				quantity: number
				currency: string
				isin?: string
			}
		}
	}
}

export default function PortfolioDetailScreen({ route }: Props) {
	const navigation = useNavigation<NativeStackNavigationProp<any>>()
	const [range, setRange] = useState<RangeKey>('1M')
	const [deals, setDeals] = useState<any[]>([])
	const { user } = useAuth()
	const { item } = route.params

	const [getHbDealsByUserId, { data: dealsData, isLoading: dealsLoading }] =
		useGetHbDealsByUserIdMutation()

	useEffect(() => {
		if (user?.oracleClientId) {
			getHbDealsByUserId({
				p_userId: user?.oracleClientId,
				ticker: item.symbol,
				aISIN: item.isin,
			})
		}
	}, [user?.oracleClientId, item.symbol])

	useEffect(() => {
		if (dealsData) {
			setDeals(dealsData)
		}
	}, [dealsData])

	const isinParams = useMemo(() => {
		const { startDate, endDate, pageSize } = buildParamsForRange(range)

		return {
			isin: item.isin || '',
			startDate,
			endDate,
			pageSize,
		}
	}, [range, item.isin])

	let rawData: any[] = []
	let isLoading = false

	const refetchOpts = {
		refetchOnMountOrArgChange: true,
		refetchOnFocus: true,
		refetchOnReconnect: true,
	}

	// Если range === '1D' - используем snapshots today, иначе ISIN
	if (range === '1D') {
		const {
			data: snapshotData,
			isLoading: isSnapshotsLoading,
			isFetching: isSnapshotsFetching,
		} = useGetSnapshotsTodayQuery(
			{ stockId: item.id, page: 1, pageSize: 20 },
			refetchOpts
		)

		rawData = snapshotData?.snapshots ?? []
		isLoading = isSnapshotsLoading || isSnapshotsFetching
	} else {
		// Для диапазонов >1D используем ISIN эндпоинт
		const {
			data: historyData,
			isLoading: isHistoryLoading,
			isFetching: isHistoryFetching,
		} = useGetStockHistoryByIsinQuery(isinParams, refetchOpts)

		rawData = (historyData as any)?.data?.history ?? []
		isLoading = isHistoryLoading || isHistoryFetching
	}

	function aggregateDataByRange(data: any[], range: RangeKey) {
		if (!data?.length) return []

		const getTime = (item: any) =>
			item?.close_time ||
			item?.time ||
			item?.closeTime ||
			item?.timestamp ||
			(typeof item?.date === 'string' ? item.date : undefined)

		if (range === '1W' || range === '1M') {
			const grouped = new Map<string, any>()
			for (const point of data) {
				const iso = getTime(point)
				if (!iso) continue
				const d = new Date(iso)
				const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
				grouped.set(key, point)
			}
			return Array.from(grouped.values())
		}

		if (range === '6M' || range === '1Y') {
			const grouped = new Map<string, any>()
			for (const point of data) {
				const iso = getTime(point)
				if (!iso) continue
				const d = new Date(iso)

				const oneJan = new Date(d.getFullYear(), 0, 1)
				const week = Math.ceil(
					((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) /
						7
				)
				const key = `${d.getFullYear()}-W${week}`

				grouped.set(key, point)
			}
			return Array.from(grouped.values())
		}

		return data
	}

	const candlesOrdered = useMemo(() => {
		let arr: any[] = rawData ?? []
		if (!arr.length) return []

		arr = aggregateDataByRange(arr, range)
		return arr.map((h: any) => ({
			close: Number(h.closePrice ?? h.close ?? h.price ?? 0),
			time: h.date ?? h.time ?? h.close_time,
		}))
	}, [rawData, range])

	const ranges: RangeKey[] = ['1D', '1W', '1M', '6M', '1Y']

	const growthPercent = useMemo(() => {
		if (!candlesOrdered || candlesOrdered.length < 2) return null

		const first = Number((candlesOrdered[0] as IntervalCandle)?.close)
		const last = Number(
			(candlesOrdered[candlesOrdered.length - 1] as IntervalCandle)?.close
		)

		if (!Number.isFinite(first) || !Number.isFinite(last) || first === 0)
			return null

		const diff = ((last - first) / first) * 100
		return diff.toFixed(2)
	}, [candlesOrdered])

	const totalValue = item.quantity * item.price

	return (
		<SafeAreaView style={{ flex: 1, margin: -18, padding: 20 }}>
			<LinearGradient
				colors={['#091F44', '#3376F6']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				style={StyleSheet.absoluteFill}
			/>
			<View style={styles.overlay} />
			<View style={styles.headerWrapper}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Icon name='arrow-back' size={24} color='#fff' />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{item.title}</Text>
				<View style={{ width: 24 }} />
			</View>
			<ScrollView style={styles.container}>
				<View style={styles.card}>
					<View style={styles.header}>
						<View style={styles.logoCircle}>
							<Text style={styles.logoLetter}>{item.symbol.charAt(0)}</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.title}>{item.title}</Text>
							<Text style={styles.subtitle}>{item.symbol}</Text>
						</View>
					</View>

					<View style={styles.priceWrapper}>
						<Text style={styles.price}>
							{item.price ? `$${item.price.toFixed(2)}` : ''}
						</Text>
						<Text
							style={[
								styles.growth,
								Number(growthPercent) < 0
									? { color: '#FF4D4F' }
									: { color: '#00FF8A' },
							]}
						>
							{Number(growthPercent) > 0 ? '▲ ' : '▼ '}
							{growthPercent}%
						</Text>
					</View>

					<View
						style={[
							styles.chartWrapper,
							{ borderRadius: 16, overflow: 'hidden' },
						]}
					>
						<LinearGradient
							colors={['transparent', 'rgba(0,0,0,0.35)']}
							style={StyleSheet.absoluteFill}
							pointerEvents='none'
						/>

						<View style={styles.chartWrapper}>
							{candlesOrdered.length >= 2 ? (
								<StockChart
									candles={candlesOrdered.map(c => ({
										close: Number(c.close),
										time: c.time,
									}))}
									range={range}
								/>
							) : (
								<View
									style={[
										styles.noData,
										{ width: Dimensions.get('window').width - 32 },
									]}
								>
									<Icon
										name='bar-chart-outline'
										size={42}
										color='rgba(255,255,255,0.5)'
									/>
									<Text style={styles.noDataText}>
										Нет данных для выбранного периода
									</Text>
								</View>
							)}

							{isLoading && (
								<View style={styles.chartLoader} pointerEvents='none'>
									<ActivityIndicator />
								</View>
							)}
						</View>

						{isLoading && (
							<View style={styles.chartLoader} pointerEvents='none'>
								<ActivityIndicator />
							</View>
						)}
					</View>

					<View style={styles.segment}>
						{ranges.map(label => {
							const active = label === range
							return (
								<TouchableOpacity
									key={label}
									style={[
										styles.segmentItem,
										active && styles.segmentItemActive,
									]}
									onPress={() => setRange(label)}
									activeOpacity={0.8}
								>
									<Text
										style={[
											styles.segmentText,
											active && styles.segmentTextActive,
										]}
									>
										{label}
									</Text>
								</TouchableOpacity>
							)
						})}
					</View>

					{!user?.isQualified ? (
						<QualificationRequired />
					) : (
						<View>
							<View style={styles.buttonsRow}>
								<TouchableOpacity
									style={styles.buyButton}
									onPress={() =>
										navigation.navigate('TradeOrder', {
											mode: 'buy',
											asset: {
												...item,
												symbol: item?.symbol,
												name: item?.title,
												priceWithCurrency: `${item?.price} ${item?.currency}`,
												pricePaper: item?.price,
											},
											freeFunds: 1200,
										})
									}
								>
									<Icon name='arrow-down' size={20} color='#000' />
									<Text style={styles.buyText}>Купить</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.sellButton}
									onPress={() =>
										navigation.navigate('TradeOrder', {
											mode: 'sell',
											asset: {
												symbol: item?.symbol,
												name: item?.title,
												priceWithCurrency: `${item?.price} ${item?.currency}`,
												pricePaper: item?.price,
											},
											freeFunds: 1200,
										})
									}
								>
									<Icon name='arrow-up' size={20} color='#fff' />
									<Text style={styles.sellText}>Продать</Text>
								</TouchableOpacity>
							</View>

							<FormInput
								label='У вас уже есть'
								value={`${item.quantity} бумаг`}
								disabled
							/>
							<FormInput
								label='На сумму'
								value={`${totalValue.toFixed(0)} ${item.currency}`}
								disabled
							/>
						</View>
					)}
				</View>

				{user?.isQualified && (
					<View style={styles.orderBlock}>
						<View style={styles.orderHeader}>
							<Text style={styles.orderTitle}>История заказов</Text>
							<TouchableOpacity>
								<Text style={styles.orderLink}>Смотреть все</Text>
							</TouchableOpacity>
						</View>

						{dealsLoading ? (
							<ActivityIndicator size='small' color='#fff' />
						) : deals.length > 0 ? (
							<View style={styles.dealsContainer}>
								{(() => {
									const groupedDeals = deals.reduce((acc, deal) => {
										const date = new Date(
											deal.deal_date || deal.open_deal_date || Date.now()
										)
										const dateKey = date.toLocaleDateString('ru-RU', {
											day: 'numeric',
											month: 'long',
										})

										if (!acc[dateKey]) {
											acc[dateKey] = []
										}
										acc[dateKey].push(deal)
										return acc
									}, {} as Record<string, any[]>)

									return (
										Object.entries(groupedDeals) as [string, any[]][]
									).map(([date, dateDeals]) => (
										<View key={date} style={styles.dateGroup}>
											<Text style={styles.dateHeader}>{date}</Text>
											{(dateDeals as any[])
												.slice(0, 10)
												.map((deal: any, index: number) => {
													const isBuy =
														deal.oper_kind?.includes('К') ||
														deal.deal_kind_id === 1
													const amount =
														deal.currency_amount || deal.amount || 0
													const sign = isBuy ? '-' : '+'

													return (
														<View
															key={`${deal.deal_id}-${index}`}
															style={styles.dealItem}
														>
															<View style={styles.dealIcon}>
																<Text style={styles.dealIconText}>H</Text>
															</View>
															<View style={styles.dealInfo}>
																<Text style={styles.dealTicker}>
																	{deal.ticker}
																</Text>
																<Text style={styles.dealType}>
																	{isBuy ? 'Покупка' : 'Продажа'}
																</Text>
															</View>
															<Text style={styles.dealAmount}>
																{sign} {amount.toFixed(2)}$
															</Text>
														</View>
													)
												})}
										</View>
									))
								})()}
							</View>
						) : (
							<Text style={styles.noDealsText}>Нет заказов</Text>
						)}
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.2)',
	},
	chartLoader: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	headerWrapper: {
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
	container: { flex: 1, padding: 16 },
	card: { borderRadius: 16, marginBottom: 24 },
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	logoCircle: {
		width: 76,
		height: 76,
		borderRadius: 36,
		marginRight: 12,
		backgroundColor: '#FF5C5C',
		justifyContent: 'center',
		alignItems: 'center',
	},
	logoLetter: {
		color: '#fff',
		fontSize: 32,
		fontWeight: 'bold',
	},
	title: { color: '#fff', fontSize: 22, fontWeight: '600', marginBottom: 7 },
	subtitle: { color: '#fff', fontSize: 10 },
	ideaLink: { color: '#00d084', fontSize: 12, textDecorationLine: 'underline' },
	priceWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
		marginBottom: 16,
	},
	price: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
	growth: { color: '#00d084', fontSize: 12, marginTop: 16 },
	chartWrapper: { alignItems: 'center' },
	weekBar: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingLeft: 40,
		marginTop: 6,
		marginBottom: 8,
		width: screenWidth - 50,
	},
	weekBarText: {
		color: 'rgba(255,255,255,0.7)',
		fontSize: 12,
	},
	segment: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.25)',
		borderRadius: 12,
		padding: 6,
		marginTop: 8,
		marginBottom: 16,
	},
	segmentItem: {
		flex: 1,
		height: 34,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	segmentItemActive: {
		backgroundColor: 'rgba(255,255,255,0.12)',
	},
	segmentText: {
		color: 'rgba(255,255,255,0.75)',
		fontSize: 12,
		fontWeight: '600',
		letterSpacing: 0.3,
	},
	segmentTextActive: {
		color: '#FFFFFF',
		fontWeight: '800',
	},
	buttonsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
	buyButton: {
		flex: 1,
		height: 48,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 16,
		backgroundColor: '#fff',
		borderRadius: 20,
	},
	sellButton: {
		flex: 1,
		height: 48,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 16,
		borderColor: '#fff',
		borderWidth: 1,
		borderRadius: 20,
	},
	buyText: { color: '#000', fontWeight: '600', fontSize: 16 },
	sellText: { color: '#fff', fontWeight: '600', fontSize: 16 },
	orderBlock: { marginTop: 10 },
	orderHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 12,
	},
	orderTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
	orderLink: { color: '#FAFAFA', fontSize: 12 },
	dealsList: {
		gap: 12,
	},
	noDealsText: {
		color: '#9AA4B1',
		textAlign: 'center',
		fontSize: 14,
	},
	noData: {
		height: 295,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.05)',
		borderRadius: 16,
		alignSelf: 'stretch',
	},
	noDataText: {
		marginTop: 8,
		color: 'rgba(255,255,255,0.6)',
		fontSize: 13,
		fontWeight: '500',
	},
	dealsContainer: {
		backgroundColor: 'rgba(255,255,255,0.1)',
		borderRadius: 12,
		padding: 16,
	},
	dateGroup: {
		marginBottom: 16,
	},
	dateHeader: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	dealItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255,255,255,0.1)',
	},
	dealIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#FF5C5C',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	dealIconText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	dealInfo: {
		flex: 1,
	},
	dealTicker: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	dealType: {
		color: 'rgba(255,255,255,0.7)',
		fontSize: 12,
		marginTop: 2,
	},
	dealAmount: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
})
