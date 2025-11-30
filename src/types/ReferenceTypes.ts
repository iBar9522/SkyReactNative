export interface ReferenceItem {
	id: string
	code: string
	title: string
	sortOrder: number
	isActive: boolean
	createdAt: string
	updatedAt: string
}

export interface Bank {
	id: string
	bic: string
	name: string
	isForeign: boolean
	sortOrder: number
	isActive: boolean
	createdAt: string
	updatedAt: string
}

export interface TopUpRequisites {
	bin: string
	kbe: string
	knp: string
	bank?: string
	iban?: string
	swift?: string
	purpose?: string
	beneficiary?: string
	iban_kzt?: string
	iban_usd?: string
	iban_eur?: string
	iban_gbp?: string

	swift_usd?: string
	swift_eur?: string
	swift_gbp?: string

	bank_usd?: string
	bank_eur?: string
	bank_gbp?: string

	beneficiary_bank?: string
}

export type TopUpMethod = {
	id: string
	title: string
	description: string
	requisites: TopUpRequisites
	file_path: string
	createdAt: string
	updatedAt: string
}
export type InvestIdeas = {
  id: string;
  title: string;
  sellPercent: number;
  buyPercent: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
