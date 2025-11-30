import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './baseQuery'

export const notificationsApi = createApi({
	reducerPath: 'notificationsApi',
	baseQuery: axiosBaseQuery,
	endpoints: builder => ({
		sendSmsCode: builder.mutation({
			query: body => ({
				url: '/notifications/send-sms-code',
				method: 'POST',
				body,
			}),
		}),
		verifyCode: builder.mutation({
			query: body => ({
				url: '/notifications/verify-code',
				method: 'POST',
				body,
			}),
		}),
		sendEmailCode: builder.mutation({
			query: body => ({
				url: '/notifications/send-email-code',
				method: 'POST',
				body,
			}),
		}),
		getNotificationsHistory: builder.query<
			any,
			{ page?: number; size?: number }
		>({
			query: ({ page = 1, size = 15 }) => ({
				url: `/notifications/history?page=${page}&size=${size}`,
				method: 'GET',
			}),
		}),
		deleteAllNotifications: builder.mutation<void, void>({
			query: () => ({
				url: '/notifications/delete-all',
				method: 'DELETE',
			}),
		}),
	}),
})

export const {
	useSendSmsCodeMutation,
	useVerifyCodeMutation,
	useSendEmailCodeMutation,
	useGetNotificationsHistoryQuery,
	useDeleteAllNotificationsMutation,
} = notificationsApi
