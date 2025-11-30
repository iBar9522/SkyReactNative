import { createApi } from '@reduxjs/toolkit/query/react'

import { axiosBaseQuery } from './baseQuery'
import {
	BiometricRegistrationOptionsResponse,
	BiometricRegistrationOptions,
	BiometricOptionsResponse,
	BiometricLoginRequest,
} from '@/types/BiometricTypes'

export const biometricApi = createApi({
	reducerPath: 'biometricApi',
	baseQuery: axiosBaseQuery,
	tagTypes: ['BiometricRegistration', 'BiometricAuth'],
	endpoints: builder => ({
		getBiometricRegistrationOptions: builder.query<
			BiometricRegistrationOptionsResponse,
			{ userId: string }
		>({
			query: ({ userId }) => ({
				url: '/auth/biometric-registration-options',
				method: 'GET',
				params: { userId },
			}),
			providesTags: ['BiometricRegistration'],
		}),
		registerBiometric: builder.mutation<any, BiometricRegistrationOptions>({
			query: body => ({
				url: '/auth/biometric-registration',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['BiometricRegistration'],
		}),
		getBiometricOptions: builder.query<any, void>({
			query: () => ({
				url: '/auth/biometric-options',
				method: 'GET',
			}),
			providesTags: ['BiometricAuth'],
		}),
		biometricLogin: builder.mutation<any, BiometricLoginRequest>({
			query: body => ({
				url: '/auth/biometric-login',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['BiometricAuth'],
		}),
	}),
})

export const {
	useGetBiometricRegistrationOptionsQuery,
	useRegisterBiometricMutation,
	useGetBiometricOptionsQuery,
	useLazyGetBiometricOptionsQuery,
	useBiometricLoginMutation,
} = biometricApi
