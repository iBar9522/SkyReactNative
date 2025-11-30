import type { NavigationProp } from '@react-navigation/native'

export type RootStackParamList = {
	Welcome: undefined
	Register: undefined
	Login: { phone?: string } | undefined
	ForgotPassword: undefined
	RequestLog: undefined
	NetworkLogger: undefined
}

export type AppNavigatorkParamList = {
	Tabs: undefined
	Welcome: undefined
	Login: undefined
	PinLogin: undefined
	Register: undefined
	ForgotPassword: undefined
	RequestLog: undefined
	Profile: undefined
	Policy: undefined
	EditPersonalInfo: undefined
	ChangePin: undefined
	Settings: undefined
	Notifications: undefined
	TradeDetail: {
		item: any
		selectedTab: string
	}
	TradeOrder: {
		mode: 'buy' | 'sell'
		asset: any
		freeFunds?: number
	}
	AutoRepoOrder: undefined
	ChangePasswordOld: undefined
	ChangePasswordNew: { oldPassword: string }
	FundAccount: undefined
	FundAccountDetail: {
		id: any
	}

	Stock: undefined
	InvestIdea: undefined

	Withdraw: undefined
	WithdrawDetail: undefined
	WithdrawSuccess: undefined
	Messages: undefined
	ViewNotifications: undefined

	InvestDetail: undefined
	CloseIdeaDetails: { idea: any }
	Deals: undefined
	Reports: undefined
	ReportsDate: undefined
	PortfolioDetail: undefined
	StepAskSupport: undefined
	Billing: undefined
	MyDeals: undefined
	QualificationIntro: undefined
	QualificationTest: undefined
	QualificationCriteria: undefined
	QualificationUpload: undefined
	TransactionHistory: undefined
}
export type AppNavigationProp = NavigationProp<AppNavigatorkParamList>
