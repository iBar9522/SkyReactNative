export type Stock = {
	id: string
	symbol: string
	name: string
	image?: string
	marketId?: string
	isActive: boolean
	createdAt: string
	updatedAt: string
	currentPrice?: string
	price7DaysAgo?: string | null
}

export type StocksResponse = { stocks: Stock[] }

export type Exchange = {
	id: string
	code: string
	name: string
	country: string
	currency: string
	timezone: string
}

export type IntervalCandle = {
	time: string
	close_time: string
	open: number
	close: number
	high: number
	low: number
	volume: number
	interval: string
	average: number
	change: number
	change_percent: number | null

	bid_high?: number
	bid_low?: number
	bid_close?: number
	bid_open?: number
	bid_first_time?: string
	bid_last_time?: string
	bid_change_percent?: number | null

	ask_high?: number
	ask_low?: number
	ask_close?: number
	ask_open?: number
	ask_first_time?: string
	ask_last_time?: string
	ask_change_percent?: number | null

	trade_count?: number
}

export type IntervalSize = '1m' | '5m' | '10m' | '15m' | '30m' | '1h'

export type GetStocksParams = {
	markets?: string[]
	page?: number
	pageSize?: number
	search?: string
	stockId?: string
	userId?: number
}

export type GetStockIntervalsParams = {
	symbol?: string
	market?: string
	intervalSize?: IntervalSize
	startDate?: string
	endDate?: string
	pageSize?: number
	userId?: number
}

export type Snapshot = {
	id: string
	stockId: string
	type: string
	price: number
	size: number
	date: string
	time: string
	level: number
	numOrders: number
	createdAt: string
	stock: {
		id: string
		symbol: string
		name: string
		marketId: string
		exchange: {
			code: string
			name: string
			country: string
			currency: string
		}
	}
}

export type SnapshotsResponse = {
	snapshots: Snapshot[]
}
