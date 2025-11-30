export interface HbPutOrderRequest {
	p_userId: number
	vORDER_DATE: string
	vORDER_TYPE_ID: number
	vDEAL_KIND_ID: number
	vISIN: string
	vTICKER: string
	vQUANTITY: number
	vPRICE: number
	vDURATION: string
	vPROFITABILITY?: number
	vSignOrderBody: string
	vBONDMARKETID?: number
	vCONTRACTORBROKERID?: number
	vCONTRACTORPERSONALACCOUNT?: string
	vCONTRACTORLASTNAME?: string
	vCONTRACTORFIRSTNAME?: string
	vCONTRACTORMIDDLENAME?: string
	vCurrency?: string
	vOrderUniqueNumber?: number
	vClientComments?: string
	vSignerInfo?: string
	vKeySerialNumber?: string
	vContractorDocument?: string
	vOperationKind?: string
	vIPOID?: number
	vMTOSenderID?: number
	vPriceQuotation?: number
	vAmount?: number
	vOrderNumber?: string
	aSubAccount?: string
	aCREATE_WITH_BOOL?: number
	aCLIENT_FAMILY_STATUS?: string
	p_sid?: string
	NoAutoConfirm?: number
	vCalcDate?: string
	vOperationDate?: string
	vP35B_AITL?: string
	vP35B_BICAITL?: string
	vCONTRACTORBROKERTEXT?: string
	vContrClientAcc?: string
	vSigned_By_SMS_Bool?: number
	vCONTRACTOR_DOC_TYPE_ID?: number
	vCONTRACTOR_DOC_SERIES?: string
	vCONTRACTOR_DOC_NUMBER?: string
	vCONTRACTOR_DOC_DATE?: string
	vCONTRACTOR_DOC_GIVED_BY?: string
	aSECBOARD?: string
	aNewSecurity?: number
	aSecTypeID?: number
	aSecCurrCode?: string
	vReturnCommissions?: number
	vAgentCode?: string
	vCommunicationType?: number
	vStructuralNotesCode?: string
	vGiftBool?: number
	BalanceExecutionTypeID?: number
	vTabysInputDate?: string
	vORIGINAL_BOOL?: number
	vCastodyBIC?: string
	vCONTRACTORIIN?: string
	vSNProlongation?: number
	vDontCheckClientClassifier?: number
	ITSInstrumentID?: number
	vMOEXSettlType?: string
	vMOEXMATCHREF?: string
	vSignOrderBodyCLOB?: string
	vExanteID?: string
	vCURRENCY_DEALS_PURPOSE_ID?: number
	vCONTRACT_NUMBER?: string
	vCONTRACT_DATE?: string
}

export interface HbPutOrderResponse {}

export type HbFreeMoneyResponse = {
	currency: string
	currencyName: string
	freeAmount: number
	blockedAmount: number
	inRepoAmount: number
	holdingPlace: string
	ftId: number
	subAccount: string
	moneyInWay: number
	liquidSec: number
	iban: string
	debts: number
	todayClosingRepo: number
	inReversRepo: number
	inNaoutoRepo: number
	endDayFreeRem: number
	moneyInWayT0: number
	moneyInWayT1: number
	moneyInWayT2: number
}[]

export type HbDealResponse = {
	deal_number: number
	instrument_name: string
	isin: string
	ticker: string
	isp: number
	nonfulfillment_reason: string
	bond_market: string
	stock_date: string
	deal_date: string
	open_deal_date: string
	sell_date: string
	oper_kind: string
	deal_kind: string
	price: number
	sell_price: number
	quantity: number
	profitability: number
	amount: number
	sell_amount: number
	stock_commission: number
	broker_commission: number
	ic_deals_order_number: string
	currency: string
	currency_amount: number
	cur_broker_commission: number
	bank_commission: number
	other_commissions: number
	percent_price: number
	sub_account: string
	unsecured_bool: number
	blocking_info: string
	status: string
	secboard: string
	deal_kind_id: number
	deal_id: number
}

export type HbOrderResponse = {
	orderId: number
	orderNumber: string
	orderDate: string
	statusId: number
	status: string
	ticker: string
	subAccount: string
	instrumentId: number
	instrumentCode: string
	direction: string
	price: number
	quantity: number
	amount: number
	currency: string
	exchangeCode: string
	tradingAccountId: string
	brokerRef: string
	executionDate: string
	settlementDate: string
	description: string
}

export interface HbPutMtoRequest {
	p_userId: number
	vMTO_Date: string
	vCurrency?: string
	vAmount?: number
	vFT_ID?: number
	vRecipient?: string
	vRecipientBank?: string
	vBik?: string
	vRecipientTprn?: string
	vRecipientIic?: string
	vCardAccount?: string
	vKbe?: string
	vKnp?: string
	vSwiftRecipientBank?: string
	vCorrAcc?: string
	vCorrBank?: string
	vSwiftCorrBank?: string
	vSignOrderBody?: string
	vMTOUniqueNumber?: number
	vClientComments?: string
	vSignerInfo?: string
	vKeySerialNumber?: string
	vPaymentPurposeText?: string
	vMTOSenderID?: number
	vRecipientIIN?: string
	vClientBankBIK?: string
	v056_bool?: number
	vMTO_Number?: string
	aSubAccount?: string
	p_sid?: string
	vSigned_By_SMS_Bool?: number
	vTo_FT_ID?: number
	vReturnCommissions?: number
	vORIGINAL_BOOL?: number
	vBankComission?: number
	vCOMMISSIONS_AGENT_FT_ID?: number
	vCOMMISSIONS_ANBANK_FT_ID?: number
	vCOMMISSIONS_FT?: number
	vWRITE_OFF_BCOM_WS_AGENT_BOOL?: number
	vWRITE_OFF_BCOM_WS_ANBANK_BOOL?: number
	vTRANFER_COMISSION?: number
	vCURRENCY_DEALS_PURPOSE_ID?: number
	vCONTRACT_NUMBER?: string
	vCONTRACT_DATE?: string
	vCURRENCY_BUY_DATE?: string
	vPaymentPurposeCode?: string
	vMONEY_SOURCE_JUSTIFICATION_ID?: number
}

export interface CurrencyRateRequest {
	fromCurrencyCode: string
	toCurrencyCode: string
	startDate: string
	endDate: string
}

export interface CurrencyRateResponse {
	fromCurrency: string
	toCurrency: string
	exchangeRateDate: string
	exchangeRate: number
}
