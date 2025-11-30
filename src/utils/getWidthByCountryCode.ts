export const getWidthsByCountryCode = (code: string) => {
	const length = code.length
	const flag = (23 + length * 2 + '%') as string
	const input = (97 - parseInt(flag) + '%') as string
	return { flag, input }
}
