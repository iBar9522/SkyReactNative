import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './baseQuery'
import {
	StocksResponse,
	GetStocksParams,
	GetStockIntervalsParams,
	Exchange,
	IntervalSize,
	IntervalCandle,
	SnapshotsResponse,
} from '@/types/MarketsTypes'
import {
	PortfolioHistoryResponse,
	PortfolioVPResponse,
} from '@/types/PortfolioTypes'

export const marketsApi = createApi({
	reducerPath: 'marketsApi',
	baseQuery: axiosBaseQuery,
	endpoints: builder => ({
		getStocks: builder.query<StocksResponse, GetStocksParams | void>({
			query: arg => {
				const { page = 1, pageSize = 10, search } = arg ?? {}
				return {
					url: '/market/stocks',
					method: 'GET',
					params: {
						page,
						pageSize,
						...(search ? { search } : {}),
					},
				}
			},
		}),
		getPopularStocks: builder.query<StocksResponse, GetStocksParams | void>({
			query: arg => {
				const { page = 1, pageSize = 10, search } = arg ?? {}
				return {
					url: '/market/popular-stocks',
					method: 'GET',
					params: {
						page,
						pageSize,
						...(search ? { search } : {}),
					},
				}
			},
		}),
		getExchanges: builder.query<Exchange[], void>({
			query: () => ({
				url: '/market/exchanges',
				method: 'GET',
			}),
		}),

		getAvailableIntervals: builder.query<IntervalSize[], void>({
			query: () => ({
				url: '/market/available-intervals',
				method: 'GET',
			}),
		}),

		getStockIntervals: builder.query<IntervalCandle[], GetStockIntervalsParams>(
			{
				query: ({
					symbol,
					intervalSize,
					startDate,
					endDate,
					pageSize = 1000,
				}) => ({
					url: `/market/intervals/${symbol}/${intervalSize}`,
					method: 'GET',
					params: { startDate, endDate, pageSize },
				}),
			}
		),
		getStocksByMarkets: builder.query<StocksResponse, GetStocksParams>({
			query: ({ markets, page = 1, pageSize = 50, search }) => ({
				url: '/market/stocks/by-markets',
				method: 'POST',
				body: { markets, page, pageSize, ...(search ? { search } : {}) },
			}),
		}),
		getStockHistory: builder.query<any, GetStockIntervalsParams>({
			query: ({ symbol, market, startDate, endDate, pageSize = 100 }) => ({
				url: `/market/stock/${symbol}/${market}/history`,
				method: 'GET',
				params: { startDate, endDate, pageSize },
			}),
		}),
		getStockHistoryByIsin: builder.query<any, { 
			isin: string
			startDate?: string
			endDate?: string
			pageSize?: number
		}>({
			query: ({ isin, startDate, endDate, pageSize = 100 }) => ({
				url: `/market/stock/history/isin/${isin}`,
				method: 'GET',
				params: { startDate, endDate, pageSize },
			}),
		}),
		getSnapshotsToday: builder.query<SnapshotsResponse, GetStocksParams>({
			query: ({ stockId, page = 1, pageSize = 50 }) => ({
				url: '/market/snapshots/today',
				method: 'GET',
				params: { stockId, page, pageSize },
			}),
		}),
		getPortfolioHistory: builder.query<
			PortfolioHistoryResponse,
			GetStockIntervalsParams
		>({
			query: ({ userId, startDate, endDate, pageSize }) => ({
				url: '/market/portfolio-history',
				method: 'POST',
				body: {
					userId,
					startDate,
					endDate,
					pageSize,
				},
			}),
		}),
		getUserDeals: builder.query<
			PortfolioVPResponse,
			{
				p_userId: number
			}
		>({
			query: ({ p_userId }) => ({
				url: '/market/vp-with-prices',
				method: 'POST',
				body: {
					p_userId,
				},
			}),
		}),
		getVPAdvanced: builder.query<any,
			{
				p_userId: number
				startDate: string
				endDate: string
				aSubAccount?: string
			}
		>({
			query: ({ p_userId, startDate, endDate, aSubAccount }) => ({
				url: '/market/vp-advanced',
				method: 'POST',
				body: {
					p_userId,
					startDate,
					endDate, 
					aSubAccount

				},
			}),
		}),
		getPortfolioMarketValue: builder.query<any,
			{
				p_userId: number
				startDate: string
				endDate: string
				aSubAccount?: string,
				currency:string
			}
		>({
			query: ({ p_userId, startDate, endDate, aSubAccount, currency }) => ({
				url: '/market/portfolio-market-value',
				method: 'POST',
				body: {
					p_userId,
					startDate,
					endDate, 
					aSubAccount,
					currency
				},
			})
		}),
		getDealsByUserId: builder.query<any, {
			p_userId: number
			
		}>({
			query: ({ p_userId }) => ({
				url: '/legacy-adapter/hb-get-deals-by-user-id',
				method: 'POST',
				body: {
					p_userId,
				},
			}),
		}),
		getInvestedSum: builder.query<any, {
			p_userId: number
		}>({
			query: ({ p_userId }) => ({
				url: '/market/invested-sum',
				method: 'POST',
				body: { p_userId },
			}),
		}),
	
	}),
})

export const {
	useGetStocksQuery,
	useGetPopularStocksQuery,
	useGetExchangesQuery,
	useGetAvailableIntervalsQuery,
	useGetStockIntervalsQuery,
	useGetStocksByMarketsQuery,
	useLazyGetStocksByMarketsQuery,
	useGetStockHistoryQuery,
	useGetStockHistoryByIsinQuery,
	useGetSnapshotsTodayQuery,
	useGetPortfolioHistoryQuery,
	useGetUserDealsQuery,
	useGetVPAdvancedQuery,
	useGetPortfolioMarketValueQuery,
	useGetDealsByUserIdQuery,
	useGetInvestedSumQuery,
} = marketsApi
