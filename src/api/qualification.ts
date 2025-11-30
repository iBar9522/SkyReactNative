import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './baseQuery'

export const qualificationApi = createApi({
	reducerPath: 'qualificationApi',
	baseQuery: axiosBaseQuery,
	endpoints: builder => ({
		getQualification: builder.query<any, void>({
			query: () => ({
				url: '/qualification/get-test',
				method: 'GET',
			}),
		}),
		verifyQualification: builder.mutation<any, void>({
			query: body => ({
				url: '/qualification/verify-test',
				method: 'POST',
				body,
			}),
		}),
		uploadQualificationFile: builder.mutation<
			{ success: boolean; fileUrl?: string },
			FormData
		>({
			query: (formData: FormData) => ({
				url: '/qualification/upload-file',
				method: 'POST',
				body: formData,
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}),
		}),
	}),
})

export const {
	useGetQualificationQuery,
	useVerifyQualificationMutation,
	useUploadQualificationFileMutation,
} = qualificationApi
