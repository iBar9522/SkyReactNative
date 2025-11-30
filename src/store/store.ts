import { configureStore } from '@reduxjs/toolkit'
import { authApi } from '../api/authApi'
import { notificationsApi } from '@/api/notificationsApi'
import authReducer from './authSlice'
import { utilsApi } from '@/api/utilsApi'
import { profileApi } from '@/api/profileApi'
import { marketsApi } from '@/api/marketsApi'
import { biometricApi } from '@/api/biometryApi'

import { investIdeasApi } from '@/api/investIdeasApi'

import { legacyAdapterApi } from '@/api/legacyAdapterApi'
import { qualificationApi } from '@/api/qualification'
import { reportApi } from '@/api/reportApi'
export const store = configureStore({
	reducer: {
		auth: authReducer,
		[authApi.reducerPath]: authApi.reducer,
		[notificationsApi.reducerPath]: notificationsApi.reducer,
		[utilsApi.reducerPath]: utilsApi.reducer,
		[profileApi.reducerPath]: profileApi.reducer,
		[marketsApi.reducerPath]: marketsApi.reducer,
		[biometricApi.reducerPath]: biometricApi.reducer,

		[investIdeasApi.reducerPath]: investIdeasApi.reducer,

		[legacyAdapterApi.reducerPath]: legacyAdapterApi.reducer,
		[qualificationApi.reducerPath]: qualificationApi.reducer,
		[reportApi.reducerPath]: reportApi.reducer,
	},
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware().concat(
			authApi.middleware,
			notificationsApi.middleware,
			utilsApi.middleware,
			profileApi.middleware,
			biometricApi.middleware,
			marketsApi.middleware,
			investIdeasApi.middleware,
			legacyAdapterApi.middleware,
			qualificationApi.middleware,
			reportApi.middleware,
		),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
