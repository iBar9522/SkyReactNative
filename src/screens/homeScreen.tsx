import BuyButton from '@/components/Button'

import BannerCarousel from '@/components/BannerCarousel'

import { useAuth } from '@/contexts/AuthContext'

import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Image,
	Linking,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import { useGetInvestmentIdeasQuery } from '@/api/investIdeasApi'
import { useLazyGetStocksByMarketsQuery } from '@/api/marketsApi'
import { InvestIdea } from '@/types/InvestIdeasTypes'
import { Stock } from '@/types/MarketsTypes'
import { ImageSourcePropType } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { InvestmentCard } from './InvestIdea/InvestmentCard'

export type HomeBanner = {
	id: string
	title: string
	image: ImageSourcePropType
	ctaText?: string
	onPress?: () => void
}

export const HOME_BANNERS: HomeBanner[] = [
	{
		id: '3',
		title: 'Вокруг света со SkyBridge Invest',
		image: require('@/assets/home_background_3.png'),
		ctaText: 'Подробнее',
		onPress: async () => {
			await Linking.openURL(
				'https://sbinvest.kz/news/pochemu-geograficheskaya-diversifikaciya-cherez-etf-osobenno-aktualna-.html'
			)
		},
	},
	{
		id: '4',
		title: 'ИИ за пределами NVIDIA',
		image: require('@/assets/home_background_4.png'),
		ctaText: 'Подробнее',
		onPress: async () => {
			await Linking.openURL(
				'https://sbinvest.kz/download/files/Invest_idei/AI_and_Geopolitics.pdf'
			)
		},
	},
]

export default function HomeScreen() {
	const navigation = useNavigation<NativeStackNavigationProp<any>>()
	const { user } = useAuth()
	const [marketBySymbol, setMarketBySymbol] = useState<
		Record<string, Stock | null>
	>({})
	const [loadMarkets, { isLoading: isMarketsLoading }] =
		useLazyGetStocksByMarketsQuery()
	const [marketLoading, setMarketLoading] = useState(false)
	const {
		data: investIdeasData,
		isLoading,
		error,
	} = useGetInvestmentIdeasQuery(undefined)

	const getInitials = () => {
		if (!user) return '??'
		const { firstName, lastName } = user

		const first = firstName?.charAt(0).toUpperCase() || ''
		const last = lastName?.charAt(0).toUpperCase() || ''
		return `${first}${last}`
	}
	const activeData = useMemo(() => {
		return investIdeasData?.data.filter(
			(idea: InvestIdea) => idea.status === 'OPEN'
		)
	}, [investIdeasData?.data])

	useEffect(() => {
		const tickers: string[] = investIdeasData?.data
			? Array.from(
					new Set(investIdeasData.data.map((i: InvestIdea) => i.ticker))
			  )
			: []

		if (tickers.length === 0) return

		let isCancelled = false

		;(async () => {
			try {
				setMarketLoading(true)
				const results = await Promise.all(
					tickers.map(ticker =>
						loadMarkets({
							markets: ['AIX', 'KASE', 'NASDAQ', 'Global'],
							search: ticker,
						})
							.unwrap()
							.then(res => ({ ticker, res }))
					)
				)

				if (isCancelled) return

				const map: Record<string, Stock | null> = {}
				results?.forEach(({ ticker, res }) => {
					const found =
						res?.data?.stocks && Array.isArray(res?.data?.stocks)
							? res?.data?.stocks.find(
									(stock: Stock) => stock.symbol === ticker
							  )
							: null
					if (found?.symbol) map[found.symbol] = found
				})
				setMarketBySymbol(map)
			} catch (e) {
				console.warn(e)
			} finally {
				if (!isCancelled) setMarketLoading(false)
			}
		})()

		return () => {
			isCancelled = true
		}
	}, [investIdeasData?.data])

	const enhancedActiveData: (InvestIdea & { marketData: Stock | null })[] =
		useMemo(() => {
			if (isLoading || !activeData) return []
			return activeData.map((idea: InvestIdea) => ({
				...idea,
				marketData: marketBySymbol[idea.ticker] ?? null,
			}))
		}, [activeData, isLoading, marketBySymbol])

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient
				colors={['#091F44', '#3376F6']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				style={StyleSheet.absoluteFill}
			/>
			<View style={styles.overlay} />

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => navigation.navigate('Profile')}>
						<View style={styles.avatar}>
							<Text style={styles.avatarText}>{getInitials()}</Text>
						</View>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.iconButton}
						onPress={() => navigation.navigate('Messages')}
					>
						<Image
							source={require('@/assets/messages.png')}
							style={styles.icon}
						/>
					</TouchableOpacity>
				</View>

				<View style={styles.welcomeContainer}>
					<Text style={styles.welcomeText}>
						С возвращением, <Text style={styles.bold}>{user?.firstName}!</Text>
					</Text>
				</View>

				<BannerCarousel data={HOME_BANNERS} />
				{user?.account ? (
					<View style={styles.buySellRow}>
						<BuyButton
							title='Купить'
							icon={require('@/assets/import.png')}
							onPress={() => navigation.navigate('Trade')}
						/>

						<TouchableOpacity
							style={styles.sellButton}
							onPress={() => navigation.navigate('Portfolio')}
						>
							<Image source={require('@/assets/withdraw.png')} />
							<Text style={styles.sellText}>Продать</Text>
						</TouchableOpacity>
					</View>
				) : (
					<View>
						<TouchableOpacity
							style={styles.openAccountButton}
							onPress={() => navigation.navigate('Billing')}
						>
							<Text style={styles.openAccountButtonText}>Открыть счет</Text>
						</TouchableOpacity>
					</View>
				)}
				<View style={styles.seeAllInvestIdeasContainer}>
					<Text style={styles.seeAllInvestIdeasText}>Инвестиционные идеи</Text>
					<TouchableOpacity
						style={styles.seeAllInvestIdeasContainer}
						onPress={() => navigation.navigate('InvestIdea')}
					>
						<Text style={styles.seeAllInvestIdeas}>Смотреть все</Text>
					</TouchableOpacity>
				</View>
				{isLoading || marketLoading ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size='large' color='#FFFFFF' />
						<Text style={styles.loadingText}>Загрузка идей...</Text>
					</View>
				) : (
					enhancedActiveData.map(
						(idea: InvestIdea & { marketData: Stock | null }) => (
							<View key={idea.id} style={styles.ideaContainer}>
								<InvestmentCard data={idea} />
							</View>
						)
					)
				)}
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#091F44',
	},
	scrollView: {
		flex: 1,
	},
	seeAllInvestIdeasContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	seeAllInvestIdeasText: {
		color: '#FAFAFA',
		fontSize: 16,
		fontWeight: '600',
		fontFamily: 'Montserrat',
		marginBottom: 16,
	},
	seeAllInvestIdeas: {
		color: '#FAFAFA',
		fontSize: 12,
		fontWeight: '600',
		textDecorationLine: 'underline',
		fontFamily: 'Montserrat',

		marginBottom: 16,
	},
	scrollContent: {
		paddingTop: 30,
		paddingHorizontal: 13,
		paddingBottom: 40,
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.2)',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 24,
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: 'rgba(255,255,255,0.1)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	dropdownIcon: {
		width: 8,
		height: 8,
	},
	ideaPeriodContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	avatarText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	iconButton: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: 'rgba(255,255,255,0.1)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	icon: {
		width: 24,
		height: 24,
		resizeMode: 'contain',
	},
	welcomeContainer: {
		marginBottom: 16,
	},
	welcomeText: {
		color: '#fff',
		fontSize: 20,
	},
	bold: {
		fontWeight: 'bold',
	},
	bannersRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 24,
		gap: 12,
	},
	bannerCard: {
		flex: 1,
		borderRadius: 12,
		overflow: 'hidden',
	},
	bannerFullImage: {
		width: '100%',
		height: 100,
		resizeMode: 'cover',
	},
	bannerOverlay: {
		position: 'absolute',
		bottom: 10,
		left: 10,
		right: 10,
	},
	bannerText: {
		color: '#fff',
		fontSize: 16,
		fontFamily: 'Montserrat',
		fontWeight: '600',
		marginBottom: 15,
	},
	bannerButtonSmall: {
		backgroundColor: '#fff',
		width: 79,
		height: 24,
		borderRadius: 4,
		alignSelf: 'flex-start',
		justifyContent: 'center',
		alignItems: 'center',
	},
	bannerButtonTextSmall: {
		color: '#000',
		fontSize: 8,
		fontWeight: '600',
		fontFamily: 'Montserrat',
	},
	buySellRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 24,
		gap: 16,
	},
	buyButton: {
		flexDirection: 'row',
		gap: 10,
		flex: 1,
		height: 55,
		backgroundColor: '#fff',
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	sellButton: {
		flexDirection: 'row',
		gap: 10,
		flex: 1,
		height: 55,
		borderWidth: 1,
		borderColor: '#fff',
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	buyText: {
		fontWeight: '600',
	},
	sellText: {
		fontWeight: '600',
		color: '#fff',
		fontFamily: 'Montserrat',
	},
	ideaWrapper: {
		marginTop: 8,
	},
	ideaWrapperHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	ideaWrapperTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '600',
		fontFamily: 'Montserrat',
	},
	ideaSeeAll: {
		color: '#ccc',
		fontSize: 14,
		textDecorationLine: 'underline',
		fontFamily: 'Montserrat',
	},
	ideaCard: {
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderRadius: 16,
		padding: 20,
		marginBottom: 16,
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
	logoImage: {
		width: 28,
		height: 28,
		resizeMode: 'contain',
	},
	ideaInfo: {
		flex: 1,
		marginLeft: 16,
	},
	ideaTitle: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		fontFamily: 'Montserrat',
		marginBottom: 4,
	},
	ideaSource: {
		color: '#9FB3C8',
		fontSize: 12,
		marginTop: 2,
		marginBottom: 12,
	},
	ideaPrice: {
		color: '#FFFFFF',
		fontSize: 14,
		fontWeight: '600',
	},
	ideaDate: {
		color: 'rgba(255,255,255,0.6)',
		fontSize: 12,
		fontFamily: 'Montserrat',
	},
	ideaDivider: {
		height: 1,
		backgroundColor: 'rgba(255,255,255,0.12)',
		marginBottom: 16,
	},
	ideaFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	ideaPeriod: {
		color: 'rgba(255,255,255,0.6)',
		fontSize: 12,
		fontFamily: 'Montserrat',
	},
	ideaROI: {
		color: '#00FF8A',
		fontSize: 18,
		fontWeight: '700',
		fontFamily: 'Montserrat',
	},
	openAccountButton: {
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		padding: 18,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 24,
	},
	openAccountButtonText: {
		color: '#000000',
		fontSize: 16,
		fontWeight: '600',
		fontFamily: 'Montserrat',
	},
	loadingContainer: {
		height: 300,
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		color: '#FFFFFF',
		marginTop: 16,
		fontSize: 16,
	},
	ideaContainer: {
		flexDirection: 'column',
		marginBottom: 16,
	},
})
