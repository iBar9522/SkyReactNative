export type UpdateProfileDTO = {
	email?: string
	firstName?: string
	lastName?: string
	phone?: string
	notificationsEnabled?: boolean
}

export type NotificationDto = {
	id: string | number
	title: string
	imagePath?: string | null
	date: string
	isRead: boolean
	createdAt?: string
}

export type GetNotificationsRequest = {
	page?: number
	limit?: number
	isRead?: boolean | null
	startDate?: string
	endDate?: string
}

export type GetNotificationsResponse = {
	data: NotificationDto[]
}
