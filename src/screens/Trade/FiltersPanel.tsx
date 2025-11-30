import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import Select, { Option } from '@/components/Select'
import FormInput from '@/components/FormInput'
import MarketTabs from './MarketTabs'
import Icon from 'react-native-vector-icons/Ionicons'

type AssetType = 'Все Инструменты' | 'Ценные бумаги' | 'Валюта' | 'РЕПО'
type SortType = 'Популярное' | 'Новое' | 'Избранное' | 'Растущее'
export type AccountId = 'USD' | 'KZT' | 'EUR' | 'RUB'
export type MarketTab = 'KASE' | 'AIX' | 'Global' | 'FX'

interface Props {
	assetType: AssetType
	sortType?: SortType
	onChangeAsset: (val: AssetType) => void
	onChangeSort: (val: SortType) => void
	FXTab?: boolean
	selectedTab: MarketTab
	selectedExchange?: string
	onChangeTab: (tab: MarketTab) => void
	onSearchChange?: (text: string) => void
	onPressFilter?: () => void
	onSelectExchange?: (val: AccountId) => void
}

const assetOptions: Array<Option<AssetType>> = [
	{ label: 'Все Инструменты', value: 'Все Инструменты' },
	{ label: 'Ценные бумаги', value: 'Ценные бумаги' },
	{ label: 'РЕПО', value: 'РЕПО' },
]

const sortOptions: Array<Option<SortType>> = [
	{ label: 'Популярное', value: 'Популярное' },
	{ label: 'Новое', value: 'Новое' },
	{ label: 'Избранное', value: 'Избранное' },
	{ label: 'Растущее', value: 'Растущее' },
]

const accountOptions: Array<Option<AccountId>> = [
	{ label: 'USD', value: 'USD' },
	{ label: 'KZT', value: 'KZT' },
	{ label: 'EUR', value: 'EUR' },
	{ label: 'RUB', value: 'RUB' },
]

const FiltersPanel: React.FC<Props> = ({
	assetType,
	sortType,
	onChangeAsset,
	onChangeSort,
	FXTab,
	selectedTab,
	selectedExchange,
	onChangeTab,
	onSearchChange,
	onPressFilter,
	onSelectExchange,
}) => {
	return (
		<View style={styles.container}>
			{!FXTab && (
				<View style={styles.searchRow}>
					<View style={styles.searchInput}>
						<FormInput
							placeholder='Поиск'
							onChangeText={onSearchChange}
							search
							isFilter
							onPressFilter={onPressFilter}
						/>
					</View>
				</View>
			)}

			<MarketTabs selected={selectedTab} onChange={onChangeTab} />

			{FXTab && (
				<View style={styles.accountSelect}>
					<Select<AccountId>
						value={selectedExchange}
						placeholder='Выберите валюту обмена'
						options={accountOptions}
						onSelect={onSelectExchange}
					/>
				</View>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: { marginBottom: 20 },
	searchRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 10,
	},
	searchInput: { flex: 1 },
	filterBtn: {
		width: 44,
		height: 44,
		borderRadius: 10,
		backgroundColor: 'rgba(255,255,255,0.08)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	filterWrapper: { flexDirection: 'row', gap: 5, marginVertical: 10 },
	assetCol: { flex: 3, minWidth: 0, flexShrink: 1 },
	sortCol: { flex: 1, minWidth: 90 },
	accountSelect: { marginTop: 10 },
})

export default FiltersPanel
