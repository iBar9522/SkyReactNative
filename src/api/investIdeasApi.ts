import { createApi } from '@reduxjs/toolkit/query/react'
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const investIdeasApi = createApi({
	reducerPath: 'investIdeasApi',
	baseQuery: fetchBaseQuery({
		baseUrl: 'https://directus-production-e61e.up.railway.app/items',
	}),
	endpoints: builder => ({
		getInvestmentIdeas: builder.query({
			query: (search?: string) => {
				const filter = search
					? `?filter[_or][0][company][_icontains]=${encodeURIComponent(
							search
					  )}&filter[_or][1][ticker][_icontains]=${encodeURIComponent(search)}`
					: ''
				return {
					url: `/invest_ideas${filter}`,
					method: 'GET',
				}
			},
		}),
		getFinancialResults: builder.query<any, void>({
			query: body => ({
				url: `/financial_results?filter[id][_in]=${body}`,
				method: 'GET',
			}),
		}),
	}),
})

export const { useGetInvestmentIdeasQuery, useGetFinancialResultsQuery } =
	investIdeasApi
