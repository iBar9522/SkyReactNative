export const mapStatusToUi = (status?: string): string => {
	if (!status) return 'Неизвестно'
	const s = status.toLowerCase()

	if (s.includes('не исполнен') || s.includes('отклонен')) return 'Не исполнен'
	if (s.includes('ребаланс')) return 'В обработке'
	if (s.includes('подтвержден')) return 'В обработке'
	if (s.includes('в работе')) return 'В обработке'
	if (s.includes('расчет')) return 'На расчетах'
	if (s.includes('исполнен')) return 'Исполнен'
	if (s.includes('ожидает')) return 'В обработке'

	return 'В обработке'
}

export const getStatusColor = (status?: string): string => {
	if (!status) return '#FFFFFF'
	const s = status.toLowerCase()

	if (s.includes('не исполнен') || s.includes('отклонен')) return '#FF5C5C' // красный
	if (
		s.includes('ребаланс') ||
		s.includes('подтвержден') ||
		s.includes('в работе') ||
		s.includes('ожидает')
	)
		return '#FFD700' // жёлтый
	if (s.includes('расчет')) return '#06D6A0' // зелёный
	if (s.includes('исполнен')) return '#FAFAFA' // серый

	return '#FFFFFF'
}
