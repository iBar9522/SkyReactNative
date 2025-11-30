import React, { useState, useMemo, useEffect } from 'react'
import {
	ActivityIndicator,
	Image,
	SafeAreaView,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

import { InvestmentCard } from './InvestmentCard'
import FormInput from '@/components/FormInput'
import LinearGradient from 'react-native-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { useGetInvestmentIdeasQuery } from '@/api/investIdeasApi'
import { useLazyGetStocksByMarketsQuery } from '@/api/marketsApi'
import { InvestIdea } from '@/types/InvestIdeasTypes'
import CloseIdeas from './CloseIdeas'
import { Stock } from '@/types/MarketsTypes'
import Icon from 'react-native-vector-icons/Ionicons'
import { debounce } from 'lodash'

const InvestmentIdeasPage = () => {
	const [activeTab, setActiveTab] = useState('Активные')
	const [searchQuery, setSearchQuery] = useState('')
	const navigation = useNavigation<any>()
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
		refetch,
	} = useGetInvestmentIdeasQuery(searchQuery || undefined)

	const closedIdeas = useMemo(() => {
		return (
			investIdeasData?.data.filter(
				(idea: InvestIdea) => idea.status === 'CLOSED'
			) || []
		)
	}, [investIdeasData?.data])

	const closedData = useMemo(() => {
		if (closedIdeas.length === 0) return []

		const successfulIdeas = closedIdeas.filter(
			(idea: InvestIdea) =>
				parseFloat(idea.price_close) > parseFloat(idea.price_open)
		)

		const successPercentage =
			(successfulIdeas.length / closedIdeas.length) * 100
		const unsuccessPercentage = 100 - successPercentage

		return [
			{
				name: 'Успешно реализованные',
				population: successPercentage,
				color: '#00D084',
				legendFontColor: '#FFFFFF',
				legendFontSize: 12,
			},
			{
				name: 'Неуспешно реализованные',
				population: unsuccessPercentage,
				color: '#FF6B6B',
				legendFontColor: '#FFFFFF',
				legendFontSize: 12,
			},
		]
	}, [closedIdeas])

	const activeData = useMemo(() => {
		return investIdeasData?.data.filter(
			(idea: InvestIdea) => idea.status === 'OPEN'
		)
	}, [investIdeasData?.data, activeTab])

	const debouncedSearch = useMemo(
		() =>
			debounce((text: string) => {
				setSearchQuery(text)
			}, 500),
		[]
	)

	useEffect(() => {
		debouncedSearch(searchQuery)
		return () => debouncedSearch.cancel()
	}, [searchQuery])

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

	const enhancedClosedData: (InvestIdea & { marketData: Stock | null })[] =
		useMemo(() => {
			if (isLoading || !closedIdeas) return []
			return closedIdeas.map((idea: InvestIdea) => ({
				...idea,
				marketData: marketBySymbol[idea.ticker] ?? null,
			}))
		}, [closedIdeas, isLoading, marketBySymbol])

	const enhancedActiveData: (InvestIdea & { marketData: Stock | null })[] =
		useMemo(() => {
			if (isLoading || !activeData) return []
			return activeData.map((idea: InvestIdea) => ({
				...idea,
				marketData: marketBySymbol[idea.ticker] ?? null,
			}))
		}, [activeData, isLoading, marketBySymbol])

	if (isLoading || marketLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<StatusBar barStyle='light-content' backgroundColor='#1a2332' />
				<LinearGradient
					colors={['#091F44', '#3376F6']}
					style={StyleSheet.absoluteFill}
					start={{ x: 0, y: 0 }}
					end={{ x: 0, y: 1 }}
				/>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size='large' color='#FFFFFF' />
					<Text style={styles.loadingText}>Загрузка идей...</Text>
				</View>
			</SafeAreaView>
		)
	}

	if (error) {
		return (
			<SafeAreaView style={styles.container}>
				<StatusBar barStyle='light-content' backgroundColor='#1a2332' />
				<LinearGradient
					colors={['#091F44', '#3376F6']}
					style={StyleSheet.absoluteFill}
					start={{ x: 0, y: 0 }}
					end={{ x: 0, y: 1 }}
				/>
				<View style={styles.loadingContainer}>
					<Text style={styles.loadingText}>Ошибка загрузки данных</Text>
				</View>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle='light-content' backgroundColor='#1a2332' />
			<LinearGradient
				colors={['#091F44', '#3376F6']}
				style={StyleSheet.absoluteFill}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
			/>

			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					style={styles.backButton}
				>
					<Icon name='arrow-back' size={24} color='#FFFFFF' />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Инвестиционные идеи</Text>
				<View style={{ width: 24 }}></View>
			</View>
			<ScrollView style={styles.scrollContainer}>
				<View style={styles.stickyHeader}>
					<View style={styles.tabContainer}>
						<TouchableOpacity
							style={[styles.tab, activeTab === 'Активные' && styles.activeTab]}
							onPress={() => setActiveTab('Активные')}
						>
							<Text
								style={[
									styles.tabText,
									activeTab === 'Активные' && styles.activeTabText,
								]}
							>
								Активные
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.tab, activeTab === 'Закрытые' && styles.activeTab]}
							onPress={() => setActiveTab('Закрытые')}
						>
							<Text
								style={[
									styles.tabText,
									activeTab === 'Закрытые' && styles.activeTabText,
								]}
							>
								Закрытые
							</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.searchContainer}>
						<FormInput
							placeholder='Поиск по компании или тикеру'
							search
							value={searchQuery}
							onChangeText={setSearchQuery}
						/>
					</View>
				</View>

				{activeTab === 'Активные' &&
				enhancedActiveData &&
				enhancedActiveData.length > 0
					? enhancedActiveData.map(idea => (
							<View key={idea.id} style={styles.ideaContainer}>
								<InvestmentCard data={idea} />
							</View>
					  ))
					: activeTab === 'Закрытые' &&
					  enhancedClosedData &&
					  enhancedClosedData.length > 0 && (
							<CloseIdeas data={closedData} closedIdeas={enhancedClosedData} />
					  )}
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,

		fontFamily: 'Montserrat',
	},

	leftArrowIcon: { width: 22, height: 18, resizeMode: 'contain' },
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		color: '#FFFFFF',
		marginTop: 16,
		fontSize: 16,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 16,
	},
	backButton: {
		marginRight: 16,
	},
	headerTitle: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: '600',
	},
	tabContainer: {
		flexDirection: 'row',
		marginHorizontal: 16,
		marginBottom: 16,
		backgroundColor: 'rgba(255,255,255,0.1)',
		borderRadius: 25,
		padding: 4,
	},
	tab: {
		flex: 1,
		paddingVertical: 12,
		alignItems: 'center',
		borderRadius: 21,
	},
	activeTab: {
		backgroundColor: '#FFFFFF',
	},
	tabText: {
		color: '#8E9AAF',
		fontSize: 16,
		fontWeight: '500',
	},
	activeTabText: {
		color: '#1a2332',
	},
	searchContainer: {
		padding: 15,
	},
	searchIcon: {
		marginRight: 12,
	},
	searchInput: {
		flex: 1,
		color: '#FFFFFF',
		fontSize: 16,
	},
	scrollContainer: {
		flex: 1,
	},
	stickyHeader: {
		backgroundColor: 'transparent',
	},
	emptyState: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 40,
	},
	emptyStateText: {
		color: '#8E9AAF',
		fontSize: 16,
		textAlign: 'center',
	},
	ideaContainer: {
		flexDirection: 'column',
		marginBottom: 16,
		paddingHorizontal: 16,
	},
})

export default InvestmentIdeasPage
