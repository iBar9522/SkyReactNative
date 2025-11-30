import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './baseQuery'
import {
	GetNotificationsRequest,
	GetNotificationsResponse,
	NotificationDto,
	UpdateProfileDTO,
} from '@/types/ProfileTypes'

export const profileApi = createApi({
	reducerPath: 'profileApi',
	baseQuery: axiosBaseQuery,
	tagTypes: ['UserProfile', 'Notifications'],
	endpoints: builder => ({
		getUserProfile: builder.query<any, void>({
			query: () => ({
				url: '/profile/get-user',
				method: 'GET',
			}),
			providesTags: ['UserProfile'],
		}),
		changePassword: builder.mutation({
			query: (body: { oldPassword: string; newPassword: string }) => ({
				url: '/profile/change-password',
				method: 'POST',
				body,
			}),
		}),
		updateUserProfile: builder.mutation({
			query: (body: UpdateProfileDTO) => ({
				url: '/profile/update-user',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['UserProfile'],
		}),
		changePin: builder.mutation({
			query: (body: { oldPin: string; newPin: string }) => ({
				url: '/profile/change-pin',
				method: 'POST',
				body,
			}),
		}),
		setPin: builder.mutation({
			query: (body: { pin: string }) => ({
				url: '/profile/set-pin',
				method: 'POST',
				body,
			}),
		}),
		getNotifications: builder.query<
			GetNotificationsResponse,
			GetNotificationsRequest
		>({
			query: body => ({
				url: '/profile/get-notifications',
				method: 'POST',
				body,
			}),
			providesTags: ['Notifications'],
		}),
		uploadProfileImage: builder.mutation<
			{ success: boolean; imageUrl: string },
			FormData
		>({
			query: (formData: FormData) => ({
				url: '/profile/upload-profile-image',
				method: 'POST',
				body: formData,
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}),
			invalidatesTags: ['UserProfile'],
		}),
	}),
})

export const {
	useLazyGetUserProfileQuery,
	useChangePasswordMutation,
	useUpdateUserProfileMutation,
	useChangePinMutation,
	useSetPinMutation,
	useGetNotificationsQuery,
	useUploadProfileImageMutation,
} = profileApi
