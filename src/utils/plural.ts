/**
 * Склонение слов по числу
 * @param value number — количество
 * @param words string[] — формы слова: ["бумага", "бумаги", "бумаг"]
 * @returns string
 */
export function declension(value: number, words: [string, string, string]) {
	const abs = Math.abs(value) % 100
	const last = abs % 10

	if (abs > 10 && abs < 20) return words[2]
	if (last > 1 && last < 5) return words[1]
	if (last === 1) return words[0]
	return words[2]
}
