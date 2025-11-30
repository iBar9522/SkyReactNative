export type RegistrationFormValues = {
	phone: string
	password: string
	firstName: string
	lastName: string
	confirmPassword: string
	code: string
	pin: string
	email: string
	isResident: boolean
	isFatca: boolean
	employmentTypeCode: string
	tradingExperience: string
	financingSourceCode: string
	isPep: boolean
	bankBic: string
	accountNumber: string
	bankName: string
	iin: string
	financingSourceDescription: string
	employmentType: string
	foreignBankSwift: string
}

export type BioguardResponse = {
	sessionId: string
	iframeUrl: string
}
