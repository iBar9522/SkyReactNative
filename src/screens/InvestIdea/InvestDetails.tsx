import React, { useState, useRef } from 'react'
import {
	SafeAreaView,
	StatusBar,
	StyleSheet,
	View,
	Image,
	Text,
	TouchableOpacity,
	ScrollView,
	Dimensions,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useRoute, useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/Ionicons'

import { toAbsoluteUrl } from './InvestmentCard'
import {
	formatPrice,
	formatPercentage,
	getPercentageColor,
} from '@/utils/investIdeasUtils'
import { calculateMetrics } from './InvestmentCard'
import { RangeKey } from '@/types/PortfolioTypes'
import PrimaryButton from '@/components/PrimaryButton'
import RecommendationsPieChart from './RecommendationPieChart'
import FinancialIndicatorsTable from './FinancialTable'
import RevenueProfitChart from './RevenueProfiChart'
import { useGetFinancialResultsQuery } from '@/api/investIdeasApi'
import AnalyticalReport from './AnalyticalReport'
import StockLineChart from './StockLineChart'
import { skip } from 'node:test'

const screenWidth = Dimensions.get('window').width

const InvestDetails = () => {
	const route = useRoute()
	const { data } = route.params as { data: any }
	const {
		data: financialData,
		isLoading: isFinancialLoading,
		error: financialError,
	} = useGetFinancialResultsQuery(data.financial_results, {
		skip: !data.financial_results,
	})
	const { currentPrice } = route.params as { currentPrice: any }
	const metrics = calculateMetrics(data, currentPrice)
	const navigation = useNavigation<any>()

	const handlePressItem = () => {
		if (!data.marketData) {
			console.warn('Нет данных о рынке для этой акции')
			return
		}

		const tradeItem = {
			id: data.marketData.id,
			logo: data.marketData.image
				? { uri: toAbsoluteUrl(data.marketData.image) }
				: undefined,
			title: data.company,
			date: data.date_opened,
			price: data.marketData.currentPrice,
			growth: undefined,
			symbol: data.ticker,
		}

		navigation.navigate('TradeDetail', {
			item: tradeItem,
			selectedTab: data?.market,
		})
	}

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle='light-content' backgroundColor='#1a2332' />
			<LinearGradient
				colors={['#091F44', '#3376F6']}
				style={StyleSheet.absoluteFill}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
			>
				<ScrollView
					style={styles.scrollView}
					showsVerticalScrollIndicator={false}
					stickyHeaderIndices={[0]}
				>
					<View style={styles.stickyHeader}>
						<View style={styles.headerContainer}>
							<TouchableOpacity onPress={() => navigation.goBack()}>
								<Icon
									name='arrow-back'
									size={24}
									color='#FFFFFF'
									style={{ margin: 16 }}
								/>
							</TouchableOpacity>
							<Text style={styles.company}>{data.ticker}</Text>
							<View style={{ width: 80 }} />
						</View>
					</View>

					<View style={styles.cardContainer}>
						<View style={styles.header}>
							<View style={styles.logoContainer}>
								{data.marketData?.image && (
									<Image
										style={styles.logoCircle}
										source={{ uri: toAbsoluteUrl(data.marketData.image) }}
									/>
								)}
							</View>
							<View style={styles.companyInfo}>
								<Text style={styles.ticker}>{data.ticker}</Text>
								<Text style={styles.companyName}>{data.company}</Text>
							</View>
							<View style={styles.returnContainer}>
								<Text
									style={[
										styles.returnPercentage,
										{ color: getPercentageColor(metrics.percentageToTarget) },
									]}
								>
									{formatPercentage(metrics.percentageToTarget)}
								</Text>
								<Text style={styles.returnLabel}>до таргета</Text>
							</View>
						</View>

						<View style={styles.divider} />

						<View style={styles.targetSection}>
							<Text style={styles.targetLabel}>Целевая доходность:</Text>
							<View style={styles.targetValueContainer}>
								<Text style={styles.targetPercentage}>
									{formatPercentage(metrics.targetReturnPercentage, true)}
								</Text>
								<Text style={styles.targetPrice}>
									{formatPrice(data.price_target)}
								</Text>
							</View>
						</View>
					</View>

					<StockLineChart data={data} />

					<View style={styles.currentWrapper}>
						<Text style={styles.currentText}>Сейчас</Text>
						<View style={styles.currentPriceContainer}>
							<Text style={styles.currentPriceText}> {currentPrice} USD </Text>
						</View>
						<PrimaryButton
							onPress={handlePressItem}
							title='Купить'
							icon={require('@/assets/import.png')}
							textStyle={styles.buyButtonText as any}
							style={styles.buyButton}
						/>
					</View>
					<View>
						<AnalyticalReport />
						<RevenueProfitChart
							data={financialData}
							isLoading={isFinancialLoading}
							error={financialError}
						/>
						<RecommendationsPieChart data={data} />
						<FinancialIndicatorsTable
							data={financialData}
							isLoading={isFinancialLoading}
							error={financialError}
						/>
						<AnalyticalReport title='Дисклеймер' content={data.description} />
					</View>
				</ScrollView>
			</LinearGradient>
		</SafeAreaView>
	)
}
export default InvestDetails
const styles = StyleSheet.create({
	container: { flex: 1, fontFamily: 'Montserrat' },
	scrollView: { flex: 1 },
	stickyHeader: { backgroundColor: 'transparent' },
	headerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 40,
		justifyContent: 'space-between',
	},
	cardContainer: {
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
		borderRadius: 16,
		padding: 20,
		margin: 16,
		fontFamily: 'Montserrat',
	},
	header: { flexDirection: 'row', alignItems: 'center', marginBottom: 0 },
	logoContainer: { marginRight: 16 },
	logoCircle: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: '#FFFFFF',
		justifyContent: 'center',
		alignItems: 'center',
	},
	company: {
		color: '#FFFFFF',
		fontSize: 20,
		fontWeight: '700',
		fontFamily: 'Montserrat',
		marginLeft: 16,
	},
	companyInfo: { flex: 1 },
	ticker: {
		color: '#FFFFFF',
		fontSize: 20,
		fontWeight: '700',
		fontFamily: 'Montserrat',
		marginBottom: 4,
	},
	companyName: {
		color: 'rgba(255, 255, 255, 0.7)',
		fontSize: 16,
		fontFamily: 'Montserrat',
	},
	returnContainer: { alignItems: 'flex-end' },
	returnPercentage: {
		color: '#06D6A0',
		fontSize: 20,
		fontWeight: '700',
		fontFamily: 'Montserrat',
	},
	returnLabel: {
		color: 'rgba(255, 255, 255, 0.6)',
		fontSize: 12,
		fontFamily: 'Montserrat',
		marginTop: 2,
	},
	divider: {
		height: 1,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		marginVertical: 16,
	},
	targetSection: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	targetLabel: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Montserrat' },
	targetValueContainer: { alignItems: 'flex-end' },
	targetPercentage: {
		color: 'white',
		fontSize: 18,
		fontWeight: '700',
		fontFamily: 'Montserrat',
	},
	targetPrice: {
		color: '#FFFFFF',
		fontSize: 18,
		marginTop: 4,
		fontWeight: '600',
		fontFamily: 'Montserrat',
	},
	priceWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
		marginBottom: 16,
	},
	price: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
	growth: { color: '#00d084', fontSize: 12, marginTop: 16 },
	chartWrapper: { alignItems: 'center', margin: 16, padding: 16 },
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
		marginHorizontal: 16,
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
	chartLoader: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	tooltipContainer: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 10,
		backgroundColor: 'rgba(10,16,35,0.9)',
		borderWidth: 1,
		borderColor: '#3B86FF',
	},
	tooltipTitle: {
		color: '#9FB3C8',
		fontSize: 11,
		textAlign: 'center',
		marginBottom: 2,
		textTransform: 'capitalize',
	},
	tooltipValue: {
		color: '#FFF',
		fontSize: 14,
		fontWeight: '700',
		textAlign: 'center',
	},

	currentWrapper: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	currentText: {
		color: '#FAFAFA',
		fontSize: 12,
		fontFamily: 'Montserrat',
	},
	currentPriceContainer: {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderRadius: 10,
		width: 350,
		justifyContent: 'center',
		alignItems: 'center',
		marginVertical: 8,
		padding: 16,
	},
	currentPriceText: {
		color: '#FFFFFF',
		fontSize: 20,
	},
	buyButton: {
		width: 350,
		backgroundColor: 'white',
	},
	buyButtonText: {
		color: 'black',
		fontSize: 16,
	},
})
