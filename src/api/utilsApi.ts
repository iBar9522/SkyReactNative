import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './baseQuery'
import { Bank, ReferenceItem, TopUpMethod } from '@/types/ReferenceTypes'

export const utilsApi = createApi({
	reducerPath: 'utilsApi',
	baseQuery: axiosBaseQuery,
	endpoints: builder => ({
		getFinancingSources: builder.query<ReferenceItem[], void>({
			query: () => ({
				url: '/financing-sources',
				method: 'GET',
			}),
		}),
	
		getBanks: builder.query<Bank[], void>({
			query: () => ({
				url: '/banks',
				method: 'GET',
			}),
		}),
		getTopUpMethods: builder.query<TopUpMethod[], void>({
			query: () => ({
				url: '/top-up-methods',
				method: 'GET',
			}),
		}),

		getTopUpMethodById: builder.query<TopUpMethod, string>({
			query: (id: string) => ({
				url: `/top-up-methods/${id}`,
				method: 'GET',
			}),
		}),
	}),
})

export const {
	useGetFinancingSourcesQuery,
	useGetBanksQuery,
	useGetTopUpMethodsQuery,
	useGetTopUpMethodByIdQuery,
} = utilsApi
