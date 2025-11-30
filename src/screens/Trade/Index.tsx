import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
	FlatList,
	ImageSourcePropType,
	SafeAreaView,
	StyleSheet,
	View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import LinearGradient from 'react-native-linear-gradient'

import {
	useGetPopularStocksQuery,
	useGetStocksByMarketsQuery,
} from '@/api/marketsApi'
import { AppNavigatorkParamList } from '@/navigation/types'
import { Stock } from '@/types/MarketsTypes'
import FiltersPanel, { AccountId } from './FiltersPanel'
import TradeList from './TradeList'
import { useDebounce } from '@/hooks/useDebounce'
import TradeFilterModal from './components/FiltersDetail'

// TODO - вынести апи хост в env
const API_HOST = 'http://82.200.247.197:3030'

const toAbsoluteUrl = (path?: string) => {
	if (!path) return undefined
	if (/^https?:\/\//i.test(path)) return path
	return `${API_HOST}${path.startsWith('/') ? path : `/${path}`}`
}

const formatDate = (iso?: string) => {
	if (!iso) return ''
	const d = new Date(iso)
	const dd = String(d.getDate()).padStart(2, '0')
	const mm = String(d.getMonth() + 1).padStart(2, '0')
	const yyyy = d.getFullYear()
	return `${dd}.${mm}.${yyyy}`
}

type TradeListItem = {
	id: string
	logo?: ImageSourcePropType
	title: string
	date: string
	price?: string
	growth?: string
	symbol: string
}

const toListItem = (s: Stock): TradeListItem => {
	const current = s.currentPrice ? Number(s.currentPrice) : null
	const prev = s.price7DaysAgo ? Number(s.price7DaysAgo) : null
	let growth: string | undefined

	if (current != null && prev != null && prev !== 0) {
		const percent = ((current - prev) / prev) * 100
		growth = `${percent.toFixed(2)}%`
	} else if (s.changePercent != null) {
		growth = `${s.changePercent}%`
	} else if (s.change != null) {
		growth = String(s.change)
	}

	return {
		...s,
		id: s.id,
		logo: s.image ? { uri: toAbsoluteUrl(s.image) } : undefined,
		title: s.symbol ? `${s.name} (${s.symbol})` : s.name,
		date: formatDate(s.updatedAt || s.createdAt),
		price: s.price != null ? String(s.price) : undefined,
		symbol: s.symbol,
		growth,
	}
}

const TradeScreen = () => {
	const navigation =
		useNavigation<NativeStackNavigationProp<AppNavigatorkParamList>>()

	const [selectedTab, setSelectedTab] = useState<
		'KASE' | 'AIX' | 'Global' | 'FX'
	>('KASE')
	const [assetType, setAssetType] = useState<
		'Все Инструменты' | 'Ценные бумаги' | 'Валюта'
	>('Все Инструменты')
	const [sortType, setSortType] = useState<
		'Популярное' | 'Новое' | 'Избранное' | 'Растущее'
	>('Популярное')
	const [searchQuery, setSearchQuery] = useState('')
	const debouncedSearch = useDebounce(searchQuery, 500)
	const [filterVisible, setFilterVisible] = useState(false)
	const [filters, setFilters] = useState<{
		status?: number
		dateRange?: string
	}>({})
	const [selectedExchange, setSelectedExchange] = useState<
		AccountId | undefined
	>()

	const [page, setPage] = useState(1)
	const prevDataRef = useRef<TradeListItem[]>([])
	const listRef = useRef<FlatList>(null)

	useEffect(() => {
		setPage(1)
		prevDataRef.current = []
		listRef.current?.scrollToOffset({ offset: 0, animated: true })
	}, [selectedTab])

	const stocksByMarkets = useGetStocksByMarketsQuery(
		{ markets: [selectedTab], page, pageSize: 20, search: debouncedSearch },
		{
			skip: selectedTab !== 'AIX' && selectedTab !== 'KASE',
			refetchOnMountOrArgChange: true,
			refetchOnFocus: true,
			refetchOnReconnect: true,
		}
	)

	const popularStocks = useGetPopularStocksQuery(
		{ page, pageSize: 20 },
		{
			skip: !['FX', 'Global'].includes(selectedTab),
			refetchOnMountOrArgChange: true,
			refetchOnFocus: true,
			refetchOnReconnect: true,
		}
	)

	const stocksResponse =
		selectedTab === 'AIX' || selectedTab === 'KASE'
			? stocksByMarkets.data?.data
			: popularStocks.data

	const total = stocksResponse?.total ?? 0
	const pageSize = stocksResponse?.pageSize ?? 20
	const hasMore = page * pageSize < total

	const baseData: Stock[] =
		selectedTab === 'AIX' || selectedTab === 'KASE'
			? stocksByMarkets.data?.data?.stocks ?? []
			: popularStocks.data?.stocks ?? []

	const listData: TradeListItem[] = useMemo(() => {
		if (page > 1 && prevDataRef.current?.length) {
			const merged = [...prevDataRef.current, ...baseData.map(toListItem)]
			const unique = Array.from(new Map(merged.map(i => [i.id, i])).values())
			return unique
		}
		return baseData.map(toListItem)
	}, [page, baseData])

	useEffect(() => {
		if (listData.length) {
			prevDataRef.current = listData
		}
	}, [listData])

	const handlePressItem = (item: any) => {
		navigation.navigate('TradeDetail', { item, selectedTab })
	}

	const handleLoadMore = () => {
		if (isLoading || !hasMore) return
		setPage(prev => prev + 1)
	}

	const isLoading =
		selectedTab === 'AIX' || selectedTab === 'KASE'
			? stocksByMarkets.isFetching
			: (selectedTab === 'FX' || selectedTab === 'Global') &&
			  popularStocks.isFetching

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient
				colors={['#091F44', '#3376F6']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				style={StyleSheet.absoluteFill}
			/>
			<View style={styles.inner}>
				<FiltersPanel
					assetType={assetType}
					sortType={sortType}
					onChangeAsset={setAssetType}
					onChangeSort={setSortType}
					FXTab={selectedTab === 'FX'}
					selectedTab={selectedTab}
					onChangeTab={setSelectedTab}
					onSearchChange={setSearchQuery}
					onPressFilter={() => setFilterVisible(true)}
					selectedExchange={selectedExchange}
					onSelectExchange={setSelectedExchange}
				/>
				<TradeList
					type={selectedTab}
					data={listData}
					onItemPress={handlePressItem}
					onEndReached={handleLoadMore}
					isLoading={isLoading}
					ref={listRef}
				/>
			</View>

			<TradeFilterModal
				visible={filterVisible}
				onClose={() => setFilterVisible(false)}
				onApply={setFilters}
				currentFilters={filters}
			/>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#0e1b36' },
	inner: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
})

export default TradeScreen
