import { ImageSourcePropType } from 'react-native'

export type PortfolioDetailProps = {
	item?: {
		id: string
		logo?: any
		title: string
		subtitle?: string
		price?: string
		growth?: string
		symbol?: string
	}
}

export type Side = 'buy' | 'sell'

export type OrderRow = {
	id: string
	logo: ImageSourcePropType
	title: string
	side: Side
	account: string
	amount: number
}

export type OrderHistoryGroup = {
	dateLabel: string
	items: OrderRow[]
}

export type RangeKey = '1D' | '1W' | '1M' | '6M' | '1Y' | 'ALL'

export interface PortfolioPeriod {
	startDate: string
	endDate: string
	totalDays: number
}

export interface PortfolioPosition {
	deal_number: number
	ticker: string
	quantity: number
	originalPrice: number
	currentPrice: number
	positionValue: number
	positionProfitLoss: number
	positionProfitPercent: number
	currency: string
	priceStatus: string
}

export interface PortfolioHistoryItem {
	date: string
	totalValue: number
	totalProfitLoss: number
	totalProfitPercent: number
	positionsCount: number
	positions: PortfolioPosition[]
}

export interface PortfolioHistoryResponse {
	success: boolean
	userId: number
	period: PortfolioPeriod
	history: PortfolioHistoryItem[]
}

export interface PortfolioVPItem {
	ticker: string
	isin: string
	security_name: string
	currency: string
	currency_name: string
	free_quantity: number
	blocked_quantity: number
	holding_place: string
	sub_account: string
	security_type_id: number
	reverse_repo_quantity: number
	repo_quantity: number
	charge_quantity: number
	lock_quantity: number
	primary_distribution_quantity: number
	buy_back_distribution_quantity: number
	reverse_auto_repo: number
	in_way_quantity: number
	average_buy_price: number
	in_way_quantity_t0: number
	in_way_quantity_t1: number
	in_way_quantity_t2: number
	latest_price: number
}

export type PortfolioVPResponse = PortfolioVPItem[]
