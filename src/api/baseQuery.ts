import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import type { AxiosRequestConfig, AxiosError } from 'axios'
import axios from 'axios'
import { logout } from '@/store/authSlice'
import { navigationRef } from '@/services/NavigationService'
import { tokenService } from '@/utils/tokenService'
import Toast from 'react-native-toast-message'
import { Buffer } from 'buffer'

const BASE_URL = 'http://82.200.247.197:3030'

export const axiosBaseQuery: BaseQueryFn<
	{
		url: string
		method: AxiosRequestConfig['method']
		body?: AxiosRequestConfig['data']
		params?: AxiosRequestConfig['params']
		headers?: AxiosRequestConfig['headers']
		responseType?: AxiosRequestConfig['responseType']
	},
	unknown,
	AxiosError
> = async ({ url, method, body, params, headers, responseType }, api) => {
	try {
		const tokens = await tokenService.getTokens()

		const response = await axios({
			baseURL: BASE_URL,
			url,
			method,
			data: body,
			params,
			headers: {
				Authorization: tokens?.accessToken
					? `Bearer ${tokens.accessToken}`
					: undefined,
				...headers,
			},
			responseType,
		})

		// If we requested binary data, convert to base64 for easier RN handling
		if (responseType === 'arraybuffer') {
			const contentType = (response.headers && (response.headers['content-type'] as string)) || 'application/octet-stream'
			const base64 = Buffer.from(response.data as ArrayBuffer).toString('base64')
			return { data: { base64, contentType } }
		}

		return { data: response.data }
	} catch (axiosError) {
		const err = axiosError as AxiosError<any>

		if (err.response?.status === 401) {
			const tokens = await tokenService.getTokens()
			if (!tokens?.refreshToken) return { error: err }

			try {
				const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
					refreshToken: tokens.refreshToken,
				})

				const newTokens = refreshResponse.data

				if (!newTokens?.accessToken || !newTokens?.refreshToken) {
					throw new Error('Refresh response missing tokens')
				}

				await tokenService.setTokens(newTokens)

				const retryResponse = await axios({
					baseURL: BASE_URL,
					url,
					method,
					data: body,
					params,
					headers: {
						Authorization: `Bearer ${newTokens.accessToken}`,
						...headers,
					},
				})

				return { data: retryResponse.data }
			} catch (refreshError) {
				await tokenService.resetTokens()
				api.dispatch(logout())
				navigationRef.navigate('Welcome')

				return { error: refreshError as AxiosError }
			}
		}

		const messages = err.response?.data?.message
		if (Array.isArray(messages)) {
			messages.forEach((msg: string) => {
				Toast.show({
					type: 'error',
					text1: 'Ошибка',
					text2: msg,
				})
			})
		} else if (typeof messages === 'string') {
			Toast.show({
				type: 'error',
				text1: 'Ошибка',
				text2: messages,
			})
		} else {
			Toast.show({
				type: 'error',
				text1: 'Ошибка',
				text2: 'Произошла ошибка запроса',
			})
		}

		return { error: err }
	}
}
