import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import StockDetail from './components/StockDetail'
import CurrencyDetail from './components/CurrencyDetail'
import BondDetail from './components/BondDetail'

type Props = {
	route: {
		params: {
			item: any
			selectedTab: string
		}
	}
}

export default function TradeDetailScreen({ route }: Props) {
	const { item, selectedTab } = route.params

	return (
		<View style={styles.container}>
			{selectedTab === 'FX' ? (
				<CurrencyDetail item={item} />
			) : (
				<BondDetail item={item} selectedTab={selectedTab} />
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#0e1b36', padding: 20 },
})
