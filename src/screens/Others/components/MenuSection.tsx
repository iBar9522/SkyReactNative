import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native'
import Button from '@/components/Button'
import { useNavigation } from '@react-navigation/native'
import { AppNavigationProp, AppNavigatorkParamList } from '@/navigation/types'

type MenuItem = {
	title: string
	icon: any
	screen: keyof AppNavigatorkParamList
}

const menuItems: MenuItem[] = [
	{
		title: 'Мои Сделки',
		icon: require('@/assets/deals.png'),
		screen: 'MyDeals',
	},
	{
		title: 'Мои отчеты',
		icon: require('@/assets/reports.png'),
		screen: 'Reports',
	},
	{
		title: 'Инвестиционные идеи',
		icon: require('@/assets/investIdea.png'),
		screen: 'InvestIdea',
	},
	{
		title: 'Вывод средств',
		icon: require('@/assets/withdrawal-funds.png'),
		screen: 'Withdraw',
	},
]

const MenuSection = () => {
	const navigation = useNavigation<AppNavigationProp>()

	return (
		<View style={styles.menuSection}>
			{menuItems.map((item, index) => (
				<TouchableOpacity
					key={index}
					style={styles.menuItem}
					onPress={() => navigation.navigate(item.screen as never)}
				>
					<View style={styles.menuIcon}>
						<Image source={item.icon} style={styles.icon} />
					</View>
					<Text style={styles.menuText}>{item.title}</Text>
				</TouchableOpacity>
			))}

			<Button
				textSize={16}
				title='Как пополнить счет?'
				onPress={() => {
					navigation.navigate('FundAccount')
				}}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	menuSection: {
		gap: 12,
	},
	menuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
		borderRadius: 8,
		padding: 20,
		position: 'relative',
		overflow: 'hidden',
	},

	menuIcon: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 16,
	},
	menuIconText: {
		fontSize: 20,
	},
	menuText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '500',
		flex: 1,
	},
	dotPattern: {
		position: 'absolute',
		right: 20,
		top: 0,
		bottom: 0,
		width: 200,
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		justifyContent: 'flex-end',
	},

	menuItemWhite: {
		backgroundColor: 'white',
		borderRadius: 16,
		padding: 20,
		alignItems: 'center',
		marginTop: 8,
	},
	menuTextDark: {
		color: '#1e293b',
		fontSize: 16,
		fontWeight: '600',
	},
	icon: {
		width: 32,
		height: 32,
		resizeMode: 'contain',
	},
})
export default MenuSection
