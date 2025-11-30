import { useAuth } from '@/contexts/AuthContext'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import BottomTabs from './BottomTabs'

import ForgotPasswordScreen from '@/screens/ForgotPassword'
import FundAccountDetailsScreen from '@/screens/FundAccount/FundAccountDetailsScreen'
import FundAccountScreen from '@/screens/FundAccount/FundAccountScreen'
import InvestmentIdeasPage from '@/screens/InvestIdea/Index'
import LoginScreen from '@/screens/loginScreen'
import ChangePasswordNewScreen from '@/screens/Profile/ChangePasswordNewScreen'
import ChangePasswordOldScreen from '@/screens/Profile/ChangePasswordOldScreen'
import ChangePinScreen from '@/screens/Profile/ChangePinScreen'
import NotificationsScreen from '@/screens/Profile/notificationsScreen'
import EditPersonalInfoScreen from '@/screens/Profile/personalInfoScreen'
import PolicyScreen from '@/screens/Profile/policyScreen'
import ProfileScreen from '@/screens/Profile/profileScreen'
import SettingsScreen from '@/screens/Profile/settingsScreen'
import RegisterScreen from '@/screens/Registration'
import RequestLogScreen from '@/screens/requestLogScreen'
import TradeDetailScreen from '@/screens/Trade/TradeDetailScreen'
import WelcomeScreen from '@/screens/welcomeScreen'
import { navigationRef } from '@/services/NavigationService'
import { useNavigation } from '@react-navigation/native'
import { AppNavigatorkParamList } from './types'

import MessagesScreen from '@/screens/Messages/MessagesScreen'
import ViewNotificationsScreen from '@/screens/Messages/ViewNotificationsScreen'
import WithdrawDetailsScreen from '@/screens/Withdraw/WithdrawDetailScreen'
import WithdrawScreen from '@/screens/Withdraw/WithdrawScreen'

import CloseIdeaDetails from '@/screens/InvestIdea/CloseIdeaDetails'
import InvestIdeaDetails from '@/screens/InvestIdea/InvestDetails'

import Billing from '@/screens/Billing'
import MyDealsScreen from '@/screens/MyDeals/MyDealsScreen'
import PortfolioDetailScreen from '@/screens/Portfolio/PortfolioDetailScreen'
import QualificationTestScreen from '@/screens/QualificationTest'
import QualificationCriteria from '@/screens/QualificationTest/QualificationCriteria'
import QualificationIntroScreen from '@/screens/QualificationTest/QualificationIntro'
import StepAskSupport from '@/screens/Registration/StepAskSupport'
import Reports from '@/screens/Reports'
import ReportsDate from '@/screens/Reports/ReportsDate'
import TradeOrderScreen from '@/screens/Trade/TradeOrderScreen'
import AutoRepoOrderScreen from '@/screens/Trade/AutoRepoOrderScreen'
import TransactionHistoryScreen from '@/screens/TransactionHistory/TransactionHistoryScreen'
import QualificationUpload from '@/screens/QualificationTest/QualificationUpload'

const Stack = createNativeStackNavigator<AppNavigatorkParamList>()

const AppNavigator = () => {
	const { user, isLoading } = useAuth()
	const navigation = useNavigation<any>()

	useEffect(() => {
		if (isLoading) return

		const current = navigationRef.isReady()
			? navigationRef.getCurrentRoute()?.name
			: undefined
		if (current === 'Register') return

		if (!user) {
			navigation.reset({
				index: 0,
				routes: [{ name: 'Welcome' }],
			})
		}
	}, [user, isLoading])

	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
				animation: 'fade',
			}}
		>
			<Stack.Screen name='Tabs' component={BottomTabs} />

			<Stack.Screen name='Welcome' component={WelcomeScreen} />
			<Stack.Screen name='Login' component={LoginScreen} />
			<Stack.Screen name='Register' component={RegisterScreen} />
			<Stack.Screen name='ForgotPassword' component={ForgotPasswordScreen} />
			<Stack.Screen name='RequestLog' component={RequestLogScreen} />
			<Stack.Screen name='Profile' component={ProfileScreen} />
			<Stack.Screen name='Policy' component={PolicyScreen} />
			<Stack.Screen
				name='EditPersonalInfo'
				component={EditPersonalInfoScreen}
			/>
			<Stack.Screen name='ChangePin' component={ChangePinScreen} />
			<Stack.Screen name='Settings' component={SettingsScreen} />
			<Stack.Screen name='Notifications' component={NotificationsScreen} />
			<Stack.Screen name='TradeDetail' component={TradeDetailScreen} />
			<Stack.Screen name='TradeOrder' component={TradeOrderScreen} />
			<Stack.Screen name='AutoRepoOrder' component={AutoRepoOrderScreen} />
			<Stack.Screen
				name='ChangePasswordOld'
				component={ChangePasswordOldScreen}
			/>
			<Stack.Screen
				name='ChangePasswordNew'
				component={ChangePasswordNewScreen}
			/>
			<Stack.Screen name='FundAccount' component={FundAccountScreen} />
			<Stack.Screen
				name='FundAccountDetail'
				component={FundAccountDetailsScreen}
			/>

			<Stack.Screen name='InvestIdea' component={InvestmentIdeasPage} />
			<Stack.Screen name='InvestDetail' component={InvestIdeaDetails} />
			<Stack.Screen name='CloseIdeaDetails' component={CloseIdeaDetails} />
			<Stack.Screen name='Withdraw' component={WithdrawScreen} />
			<Stack.Screen name='WithdrawDetail' component={WithdrawDetailsScreen} />
			<Stack.Screen name='Messages' component={MessagesScreen} />
			<Stack.Screen
				name='ViewNotifications'
				component={ViewNotificationsScreen}
			/>
			<Stack.Screen name='PortfolioDetail' component={PortfolioDetailScreen} />
			<Stack.Screen name='StepAskSupport' component={StepAskSupport} />
			<Stack.Screen name='Reports' component={Reports}></Stack.Screen>
			<Stack.Screen name='ReportsDate' component={ReportsDate}></Stack.Screen>
			<Stack.Screen name='Billing' component={Billing} />
			<Stack.Screen name='MyDeals' component={MyDealsScreen} />
			<Stack.Screen
				name='TransactionHistory'
				component={TransactionHistoryScreen}
			/>
			<Stack.Screen
				name='QualificationIntro'
				component={QualificationIntroScreen}
			/>
			<Stack.Screen
				name='QualificationTest'
				component={QualificationTestScreen}
			/>
			<Stack.Screen
				name='QualificationCriteria'
				component={QualificationCriteria}
			/>
			<Stack.Screen
				name='QualificationUpload'
				component={QualificationUpload}
			/>
		</Stack.Navigator>
	)
}

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#000',
	},
})

export default AppNavigator
