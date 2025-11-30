import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './baseQuery'
import { BioguardResponse } from '@/types/AuthTypes'

export const authApi = createApi({
	reducerPath: 'authApi',
	baseQuery: axiosBaseQuery,
	endpoints: builder => ({
		register: builder.mutation({
			query: body => ({
				url: '/auth/register-user',
				method: 'POST',
				body,
			}),
		}),
		createBill: builder.mutation({
			query: body => ({
				url: '/auth/create-account',
				method: 'POST',
				body,
			}),
		}),
		loginByPhone: builder.mutation({
			query: body => ({
				url: '/auth/login-by-phone',
				method: 'POST',
				body,
			}),
		}),
		loginByPin: builder.mutation({
			query: body => ({
				url: '/auth/login-by-pin',
				method: 'POST',
				body,
			}),
		}),
		resetPasswordByPhone: builder.mutation({
			query: body => ({
				url: '/auth/reset-password-by-phone',
				method: 'POST',
				body,
			}),
		}),
		logout: builder.mutation<void, { refreshToken: string; fcmToken: string }>({
			query: ({ refreshToken, fcmToken }) => ({
				url: '/auth/logout',
				method: 'POST',
				body: { refreshToken, fcmToken },
			}),
		}),
		getBioguardIframe: builder.query<BioguardResponse, void>({
			query: () => ({
				url: '/auth/fcb-bioguard-iframe',
				method: 'GET',
			}),
		}),
		getBioguardCallbackFrontend: builder.query<any, void>({
			query: () => ({
				url: '/auth/fcb-bioguard-callback-frontend',
				method: 'GET',
			}),
		}),
		checkBiometricVerification: builder.mutation<
			{
				verified: boolean
				personData: {
					iin: string
					surname: string
					name: string
					dob: string
				}
			},
			{ sessionId: string }
		>({
			query: body => ({
				url: '/auth/biometric-verification/check',
				method: 'POST',
				body,
			}),
		}),
	}),
})

export const {
	useRegisterMutation,
	useLoginByPhoneMutation,
	useLoginByPinMutation,
	useResetPasswordByPhoneMutation,
	useLogoutMutation,
	useLazyGetBioguardIframeQuery,
	useGetBioguardCallbackFrontendQuery,
	useCreateBillMutation,
	useCheckBiometricVerificationMutation,
} = authApi
