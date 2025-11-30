export const formatPhoneNumber = (value: string): string => {
	const clean = value.replace(/\D/g, '').slice(0, 10)

	if (clean.length <= 3) return clean
	if (clean.length <= 6) return `${clean.slice(0, 3)} ${clean.slice(3)}`
	if (clean.length <= 8)
		return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`
	return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(
		6,
		8
	)} ${clean.slice(8)}`
}

export const normalizeDateTime = (
	date?: string | null,
	time?: string | null
): string => {
	if (!date) return '—'

	// 1) Если пришёл ISO формат
	if (date.includes('T')) {
		const dt = new Date(date)
		if (isNaN(dt.getTime())) return '—'
		return dt.toLocaleDateString('ru-RU')
	}

	// 2) Если пришёл формат YYYYMMDD + time
	if (date.length === 8) {
		const year = Number(date.slice(0, 4))
		const month = Number(date.slice(4, 6)) - 1
		const day = Number(date.slice(6, 8))

		let h = '00',
			m = '00',
			s = '00',
			ms = '0'

		if (time && typeof time === 'string') {
			const parts = time.split(':')
			h = parts[0] ?? '00'
			m = parts[1] ?? '00'

			const secPart = parts[2]?.split('.') ?? []
			s = secPart[0] ?? '00'
			ms = secPart[1] ?? '0'
		}

		const d = new Date(
			Date.UTC(year, month, day, Number(h), Number(m), Number(s), Number(ms))
		)
		return d.toLocaleDateString('ru-RU')
	}

	const d = new Date(date)
	if (isNaN(d.getTime())) return '—'

	return d.toLocaleDateString('ru-RU')
}

export const getCurrencySymbol = (currencyCode?: string): string => {
	if (!currencyCode) return ''

	const code = currencyCode.trim().toUpperCase()

	switch (code) {
		case 'USD':
		case 'ДОЛЛАР':
		case '$':
			return '$'
		case 'KZT':
		case 'ТЕНГЕ':
			return '₸'
		case 'EUR':
		case 'ЕВРО':
			return '€'
		case 'RUB':
		case 'РУБЛЬ':
			return '₽'
		case 'GBP':
			return '£'
		case 'CNY':
			return '¥'
		default:
			return code
	}
}
