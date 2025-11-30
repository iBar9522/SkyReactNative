import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import AIX from '@/assets/aix.svg'
import KASE from '@/assets/kase.svg'
import AIX_Active from '@/assets/aix-active.svg'
type MarketTab = 'KASE' | 'AIX' | 'Global' | 'FX'

interface Props {
	selected: MarketTab
	onChange: (tab: MarketTab) => void
}

const MarketTabs: React.FC<Props> = ({ selected, onChange }) => {
	const tabs: MarketTab[] = ['KASE', 'AIX', 'Global', 'FX']

	const getTabContent = (tab: MarketTab, isActive: boolean) => {
		switch (tab) {
			case 'KASE':
				return (
					<KASE/>
				)
			case 'AIX':
				return (
					isActive ? <AIX_Active/> : <AIX/>
				
					
				)
			default:
				return (
					<Text style={[styles.tabText, isActive && styles.activeTabText]}>
						{tab}
					</Text>
				)
		}
	}

	return (
		<View style={styles.tabRow}>
			{tabs.map(tab => {
				const isActive = selected === tab
				return (
					<TouchableOpacity
						key={tab}
						onPress={() => onChange(tab)}
						style={[styles.tab, isActive && styles.activeTab]}
						activeOpacity={0.9}
					>
						{getTabContent(tab, isActive)}
					</TouchableOpacity>
				)
			})}
		</View>
	)
}

const styles = StyleSheet.create({
	tabRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 10,
	},
	tab: {
		flex: 1,
		borderRadius: 6,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
		alignItems: 'center',
		justifyContent: 'center',
		height: 32,
	},
	activeTab: {
		backgroundColor: '#fff',
	},
	tabText: {
		color: '#fff',
		fontSize: 12,
		fontFamily: 'Montserrat',
		fontWeight: '500',
	},
	activeTabText: {
		color: '#212121',
	},
	logoImage: {
		height: 22,
	},
	logoImageActive: {
		tintColor: 'black',
	},
})

export default MarketTabs
