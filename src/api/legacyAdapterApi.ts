import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './baseQuery'
import {
	CurrencyRateRequest,
	CurrencyRateResponse,
	HbDealResponse,
	HbFreeMoneyResponse,
	HbOrderResponse,
	HbPutMtoRequest,
	HbPutOrderRequest,
	HbPutOrderResponse,
} from '@/types/LegacyAdapterTypes'

// TODO: Типизировать апи

export const legacyAdapterApi = createApi({
	reducerPath: 'legacyAdapterApi',
	baseQuery: axiosBaseQuery,
	tagTypes: ['LegacyAdapter'],
	endpoints: builder => ({
		createOaoOrder: builder.mutation<any, any>({
			query: body => ({
				url: '/legacy-adapter/oao-put-order',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['LegacyAdapter'],
		}),

		getOrderStatus: builder.query<any, string>({
			query: orderId => ({
				url: `/legacy-adapter/order-status/${orderId}`,
				method: 'GET',
			}),
			providesTags: ['LegacyAdapter'],
		}),

		createHbOrder: builder.mutation<HbPutOrderResponse, HbPutOrderRequest>({
			query: body => ({
				url: '/legacy-adapter/hb-put-order',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['LegacyAdapter'],
		}),
		getHbFreeMoneyByUserId: builder.mutation<
			HbFreeMoneyResponse,
			{
				userId: number
				aSubAccount?: string
				p_sid?: string
				WithZeroAccounts?: number
				WithIBAN?: number
			}
		>({
			query: body => ({
				url: '/legacy-adapter/hb-getMoneyByUserId',
				method: 'POST',
				body,
			}),
		}),
		getHbOrdersByUserId: builder.mutation<
			HbOrderResponse[],
			{
				userId: number
				begDate?: string
				endDate?: string
				statusId?: number
				orderId?: number
				subAccount?: string
				sid?: string
				showPartedOrders?: number
				search?: string
			}
		>({
			query: ({ search, ...body }) => ({
				url: `/legacy-adapter/getOrdersByUserId${
					search ? `?search=${encodeURIComponent(search)}` : ''
				}`,
				method: 'POST',
				body,
			}),
		}),
		createHbPutMto: builder.mutation<
			any,
			{ buySellOrderId?: number; body: HbPutMtoRequest }
		>({
			query: ({ buySellOrderId, body }) => {
				const requestBody = {
					...body,
					...(buySellOrderId ? { buySellOrderId } : {}),
				}

				return {
					url: '/legacy-adapter/hb-put-mto',
					method: 'POST',
					body: requestBody,
				}
			},
			invalidatesTags: ['LegacyAdapter'],
		}),

		getHbDealsByUserId: builder.mutation<
			any[],
			{
				p_userId: number
				begDate?: string
				endDate?: string
				ticker?: string
				subAccount?: string
				sid?: string
				aISIN?: string
			}
		>({
			query: body => ({
				url: '/legacy-adapter/hb-get-deals-by-user-id',
				method: 'POST',
				body,
			}),
		}),
		getCurrencyRate: builder.mutation<
			CurrencyRateResponse[],
			CurrencyRateRequest
		>({
			query: body => ({
				url: '/legacy-adapter/get-currency-rate',
				method: 'POST',
				body,
			}),
		}),
		addBuySellOrderDirectus: builder.mutation<
			HbPutOrderResponse,
			{
				data: HbPutOrderRequest
				oracle_order_id?: number
				pending_money_transfer?: boolean
			}
		>({
			query: body => ({
				url: '/legacy-adapter/add-buy-sell-order-directus',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['LegacyAdapter'],
		}),
		addMtoDirectus: builder.mutation<
			HbPutMtoRequest,
			{
				data: HbPutMtoRequest
				buy_sell_order_id?: number
				oracle_order_id?: number
			}
		>({
			query: body => ({
				url: '/legacy-adapter/add-mto-directus',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['LegacyAdapter'],
		}),
		getClientAttributes: builder.query<any, number>({
			query: oracleUserId => ({
				url: `/legacy-adapter/get-client-attributes/${oracleUserId}`,
				method: 'GET',
			}),
		}),
		cancelHbOrder: builder.mutation<
			any,
			{
				p_userId: number
				vOrderID: number
				vSignOrderBody: string
				vOrderDate: string
				vDuration: string
				vOrderUniqueNumber: number
				vClientComments?: string
				vSignerInfo?: string
				vKeySerialNumber?: string
				vMTOSenderID?: number
				vOrderNumber?: string
				p_SID?: string
			}
		>({
			query: body => ({
				url: '/legacy-adapter/hb-reject-order',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['LegacyAdapter'],
		}),
	}),
})

export const {
	useCreateOaoOrderMutation,
	useGetOrderStatusQuery,
	useCreateHbOrderMutation,
	useGetHbFreeMoneyByUserIdMutation,
	useGetHbOrdersByUserIdMutation,
	useCreateHbPutMtoMutation,
	useGetHbDealsByUserIdMutation,
	useGetCurrencyRateMutation,
	useAddBuySellOrderDirectusMutation,
	useAddMtoDirectusMutation,
	useGetClientAttributesQuery,
	useCancelHbOrderMutation,
} = legacyAdapterApi
