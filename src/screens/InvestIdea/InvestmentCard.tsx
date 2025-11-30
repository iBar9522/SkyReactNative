import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { InvestIdea, InvestIdeaCalculations } from '@/types/InvestIdeasTypes'
import {
	formatPrice,
	formatPercentage,
	formatDate,
	getPercentageColor,
} from '@/utils/investIdeasUtils'
import { Stock } from '@/types/MarketsTypes'

interface InvestmentCardProps {
	data: InvestIdea & { marketData: Stock | null }
}

export const calculateMetrics = (
	data: InvestIdea,
	currentPrice: number
): InvestIdeaCalculations => {
	const priceOpen = parseFloat(data.price_open)
	const priceTarget = parseFloat(data.price_target)

	//  до таргета
	const percentageToTarget = ((priceTarget - currentPrice) / currentPrice) * 100

	// целевая доходность проценты
	const targetReturnPercentage = ((priceTarget - priceOpen) / priceOpen) * 100

	let progressPercentage = 0
	const color = currentPrice < priceOpen ? 'red' : 'green'

	if (currentPrice < priceOpen) {
		progressPercentage = 0
	} else if (currentPrice >= priceTarget) {
		progressPercentage = 100
	} else {
		progressPercentage =
			((currentPrice - priceOpen) / (priceTarget - priceOpen)) * 100
	}

	return {
		percentageToTarget,
		targetReturnPercentage,
		progressPercentage: Math.max(0, Math.min(100, progressPercentage)),
		color,
		currentPrice: currentPrice,
	}
}
const API_HOST = 'http://82.200.247.197:3030'

export const toAbsoluteUrl = (path?: string) => {
	if (!path) return undefined
	if (/^https?:\/\//i.test(path)) return path
	return `${API_HOST}${path.startsWith('/') ? path : `/${path}`}`
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({ data }) => {
	const navigation = useNavigation<any>()

	const currentPrice =
		data.marketData && data.marketData.currentPrice
			? parseFloat(data.marketData.currentPrice)
			: 0
	const metrics = calculateMetrics(data, currentPrice)
	const TOTAL_SEGMENTS = 50
	const activeSegments =
		metrics.progressPercentage === 0
			? 1
			: Math.max(
					0,
					Math.min(
						TOTAL_SEGMENTS,
						Math.round((metrics.progressPercentage / 100) * TOTAL_SEGMENTS)
					)
			  )

	const handlePressItem = (
		investIdea: InvestIdea & { marketData: Stock | null }
	) => {
		if (!investIdea.marketData) {
			console.warn('Нет данных о рынке для этой акции')
			return
		}

		const tradeItem = {
			id: investIdea.marketData.id,
			logo: investIdea.marketData.image
				? { uri: toAbsoluteUrl(investIdea.marketData.image) }
				: undefined,
			title: investIdea.company,
			date: investIdea.date_opened,
			price: investIdea.marketData.currentPrice,
			growth: undefined,
			symbol: investIdea.ticker,
		}

		navigation.navigate('TradeDetail', {
			item: tradeItem,
			selectedTab: data.marketData?.marketId || 'AIX',
		})
	}

	return (
		<View style={styles.container}>
			<TouchableOpacity
				onPress={() =>
					navigation.navigate('InvestDetail', { data, currentPrice })
				}
			>
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
								{
									color: getPercentageColor(metrics.percentageToTarget),
								},
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

				<View style={styles.divider} />

				<View style={styles.progressSection}>
					<View style={styles.progressBarContainer}>
						<View style={styles.progressBar}>
							{Array.from({ length: TOTAL_SEGMENTS }).map((_, index) => (
								<View
									key={index}
									style={[
										styles.progressSegment,
										index < activeSegments
											? metrics.color === 'green'
												? styles.progressSegmentActive
												: styles.progressSegmentActiveRed
											: styles.progressSegmentInactive,
									]}
								/>
							))}
						</View>
					</View>
					<View style={styles.progressLabels}>
						<View style={styles.progressLabelContainer}>
							<Text style={styles.progressPrice}>
								{formatPrice(data.price_open)}
							</Text>
							<Text style={styles.progressDate}>
								{formatDate(data.date_opened)}
							</Text>
						</View>
						<View style={styles.progressLabelContainer}>
							<Text style={styles.progressPrice}>
								{formatPrice(metrics.currentPrice || 0)}
							</Text>
							<Text style={styles.progressDate}>сегодня</Text>
						</View>
						<View style={styles.progressLabelContainer}>
							<Text style={styles.progressPrice}>
								{formatPrice(data.price_target)}
							</Text>
							{data.date_target && (
								<Text style={styles.progressDate}>
									{formatDate(data.date_target)}
								</Text>
							)}
						</View>
					</View>
				</View>

				<View style={styles.buttonContainer}>
					<TouchableOpacity
						onPress={() =>
							navigation.navigate('InvestDetail', { data, currentPrice })
						}
						style={styles.detailButton}
					>
						<Text style={styles.detailButtonText}>Подробнее</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.buyButton,
							data.status === 'CLOSED' && styles.buyButtonDisabled,
						]}
						onPress={() => handlePressItem(data)}
						disabled={data.status === 'CLOSED'}
					>
						<Image
							source={require('@/assets/import.png')}
							style={styles.buyIcon}
						/>
						<Text
							style={[
								styles.buyButtonText,
								data.status === 'CLOSED' && styles.buyButtonTextDisabled,
							]}
						>
							{data.status === 'CLOSED' ? 'Закрыта' : 'Купить'}
						</Text>
					</TouchableOpacity>
				</View>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
		borderRadius: 16,
		padding: 20,
		// margin: 16,
		fontFamily: 'Montserrat',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	logoContainer: {
		marginRight: 16,
	},

	logoCircle: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: '#FFFFFF',
		justifyContent: 'center',
		alignItems: 'center',
	},
	logoImage: {
		width: 32,
		height: 32,
		resizeMode: 'contain',
	},
	companyInfo: {
		flex: 1,
	},
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
	returnContainer: {
		alignItems: 'flex-end',
	},
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
	targetLabel: {
		color: '#FFFFFF',
		fontSize: 16,
		fontFamily: 'Montserrat',
	},
	targetValueContainer: {
		alignItems: 'flex-end',
	},
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
	progressSection: {
		marginBottom: 20,
	},
	progressPercentage: {
		color: '#FFFFFF',
		fontSize: 14,
		fontFamily: 'Montserrat',
		textAlign: 'center',
		marginBottom: 8,
	},
	progressBarContainer: {
		marginBottom: 12,
	},
	progressBar: {
		height: 8,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 4,
	},
	progressSegment: {
		flex: 1,
		height: '100%',
		borderRadius: 4,
	},
	progressSegmentActive: {
		backgroundColor: '#06D6A0',
	},
	progressSegmentActiveRed: {
		backgroundColor: '#FF6B6B',
	},
	progressSegmentInactive: {
		backgroundColor: 'rgba(255, 255, 255, 0.3)',
	},
	progressLabels: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	progressLabelContainer: {
		alignItems: 'center',
	},
	progressPrice: {
		color: '#FFFFFF',
		fontSize: 12,
		fontWeight: '600',
		fontFamily: 'Montserrat',
		marginBottom: 2,
	},
	progressDate: {
		color: 'rgba(255, 255, 255, 0.6)',
		fontSize: 10,
		fontFamily: 'Montserrat',
	},
	buttonContainer: {
		flexDirection: 'row',
		gap: 12,
	},
	detailButton: {
		flex: 1,
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.3)',
		borderRadius: 25,
		paddingVertical: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	detailButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '500',
		fontFamily: 'Montserrat',
	},
	buyButton: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		borderRadius: 25,
		paddingVertical: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	buyIcon: {
		width: 16,
		height: 16,
		resizeMode: 'contain',
	},
	buyButtonText: {
		color: '#1A2332',
		fontSize: 16,
		fontWeight: '600',
		fontFamily: 'Montserrat',
	},
	buyButtonDisabled: {
		backgroundColor: 'rgba(255, 255, 255, 0.3)',
	},
	buyButtonTextDisabled: {
		color: 'rgba(255, 255, 255, 0.6)',
	},
})
