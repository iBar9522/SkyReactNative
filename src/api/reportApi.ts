import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './baseQuery'

export const reportApi = createApi({
	reducerPath: 'reportApi',
	baseQuery: axiosBaseQuery,
	endpoints: builder => ({
			getReports: builder.query<any, any>({
				query: (body) => ({
					url: '/report/order-execution-report',
					method: 'POST',
					body,
					headers: { Accept: 'application/pdf' },
					
					responseType: 'arraybuffer',
				}),
			}),
			getReportsDate: builder.query<any, any>({
				query: (body) => ({
					url: '/report/extract-report',
					method: 'POST',
					body,
					headers: { Accept: 'application/pdf' },
					
					responseType: 'arraybuffer',
				}),
			}),
	}),
})

export const {  useLazyGetReportsQuery, useLazyGetReportsDateQuery } = reportApi