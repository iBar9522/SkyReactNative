import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import HomeScreen from '@/screens/homeScreen'
import Others from '@/screens/Others/Index'
import PortfolioScreen from '@/screens/Portfolio/PortfolioScreen'
import TradeScreen from '@/screens/Trade/Index'
import TradeActiveIcon from '@/assets/trade_active.svg'
import TradeInactiveIcon from '@/assets/trade_inactive.svg'
import BriefcaseIcon from '@/assets/briefcase_inactive.svg'
import BriefcaseActiveIcon from '@/assets/briefcase_active.svg'
import OthersIcon from '@/assets/others_inactive.svg'
import OthersActiveIcon from '@/assets/others_active.svg'
import MainActiveIcon from '@/assets/main_active.svg'
import MainInactiveIcon from '@/assets/main_inactive.svg'
const Tab = createBottomTabNavigator()

const TabIcon = ({
	focused,
	Icon,
	ActiveIcon,
	label,
}: {
	focused: boolean
	Icon: any
	ActiveIcon: any
	label: string
}) => (
	<View style={styles.iconWrapper}>
		<View style={[styles.iconCircle, focused && styles.iconCircleActive]}>
			{focused ? <ActiveIcon /> : <Icon />}
		</View>
		{!focused && <Text style={styles.label}>{label}</Text>}
	</View>
)

const BottomTabs = () => {
	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarStyle: styles.tabBar,
				tabBarShowLabel: false,
			}}
		>
			<Tab.Screen
				name='Home'
				component={HomeScreen}
				options={{
					tabBarIcon: ({ focused }) => (
						<TabIcon
							focused={focused}
							Icon={MainActiveIcon}
							ActiveIcon={MainInactiveIcon}
							label='Главная'
						/>
					),
				}}
			/>
			<Tab.Screen
				name='Trade'
				component={TradeScreen}
				options={{
					tabBarIcon: ({ focused }) => (
						<TabIcon
							focused={focused}
							Icon={TradeInactiveIcon}
							ActiveIcon={TradeActiveIcon}
							label='Рынки'
						/>
					),
				}}
			/>
			<Tab.Screen
				name='Portfolio'
				component={PortfolioScreen}
				options={{
					tabBarIcon: ({ focused }) => (
						<TabIcon
							focused={focused}
							Icon={BriefcaseIcon}
							ActiveIcon={BriefcaseActiveIcon}
							label='Портфель'
						/>
					),
				}}
			/>
			<Tab.Screen
				name='Others'
				component={Others}
				options={{
					tabBarIcon: ({ focused }) => (
						<TabIcon
							focused={focused}
							Icon={OthersIcon}
							ActiveIcon={OthersActiveIcon}
							label='Другое'
						/>
					),
				}}
			/>
		</Tab.Navigator>
	)
}

export default BottomTabs

const styles = StyleSheet.create({
	tabBar: {
		backgroundColor: 'rgba(0, 0, 0, 0.33)',
		borderRadius: 120,
		height: 70,
		marginHorizontal: 24,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)',
		position: 'absolute',
		bottom: 16,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	iconWrapper: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	iconCircle: {
		backgroundColor: 'transparent',
		borderRadius: 100,
		marginBottom: 5,
		marginTop: 5,
	},
	iconCircleActive: {
		padding: 12,
		marginBottom: 0,
		backgroundColor: '#fff',
	},
	icon: {
		width: 34,
		height: 34,
	},
	label: {
		width: 38,
		textAlign: 'center',
		fontSize: 7,
		color: '#fff',
		fontFamily: 'Montserrat',
	},
})
