import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { getCurrencySymbol } from '@/utils/formats'

interface Props {
	type: string
	item: {
		logo: any
		title: string
		date: string
		price?: string
		rate?: string
		term?: string
		maturity?: string
		growth?: string
	}
}

const TradeCard: React.FC<Props> = ({ type, item }) => {
	const isBond = type === 'Global'
	const isCurrency = type === 'FX'
	const isRepo = type === 'РЕПО'

	const formatDate = (date: Date) => format(date, 'dd.MM.yyyy', { locale: ru })

	const today = new Date()
	const dayAgo = new Date()
	dayAgo.setDate(today.getDate() - 1)

	if (isCurrency) {
		return (
			<View style={styles.card}>
				<Text style={styles.fxSource}>Источник: FX</Text>
				<View style={styles.fxRow}>
					<Text style={styles.fxCurrency}>RUB</Text>
					<Ionicons name='swap-horizontal' size={18} color='#fff' />
					<Text style={styles.fxCurrency}>KZT</Text>
				</View>

				{/* <View style={styles.fxMainRow}>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							gap: 8,
							flexShrink: 1,
						}}
					>
						<Text style={styles.fxPairLeft}>
							{item.title?.split(/[^\w]+/)[0] ?? 'USD'}
						</Text>
	
						<Text style={styles.fxPairRight}>
							{item.title?.split(/[^\w]+/)[1] ?? 'KZT'}
						</Text>
					</View>

					<Text style={styles.fxRate}>
						{(item.rate ?? item.price ?? '—') + ' KZT'}
					</Text>
				</View> */}

				<View style={styles.fxDeltaRow}>
					<Ionicons name='caret-up' size={14} color='#00FF8A' />
					<Text style={styles.fxDeltaText}>{item.growth ?? '—'}</Text>
				</View>

				<View style={styles.fxHintRow}>
					<Text style={styles.fxHintText}>
						vs. прошлая неделя (20–27 марта)
					</Text>
					<Ionicons
						name='chevron-down'
						size={18}
						color='rgba(255,255,255,0.6)'
					/>
				</View>
			</View>
		)
	}

	return (
		<View style={styles.card}>
			<View style={styles.header}>
				<View style={styles.logoCircle}>
					<Image source={item.logo} style={styles.logoImage} />
				</View>
				<View style={styles.info}>
					<Text style={styles.title}>{item.title}</Text>
					<Text style={styles.source}>Источник: {item.source ?? type}</Text>
				</View>
				<Text style={styles.price}>
					{item.currentPrice &&
						`${item.currentPrice}${getCurrencySymbol(
							item?.exchange?.currency
						)}`}
				</Text>
			</View>

			<View style={styles.divider} />

			<View style={styles.footer}>
				<Text style={styles.period}>
					{`Период с ${formatDate(dayAgo)} - ${formatDate(today)}`}
				</Text>
				<Text
					style={[
						styles.growth,
						item.growth?.startsWith('-')
							? { color: '#FF4D4F' }
							: { color: '#00FF8A' },
					]}
				>
					{item.growth}
				</Text>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderRadius: 16,
		padding: 16,
		marginBottom: 16,
		height: 147,
	},
	fxSource: {
		color: 'rgba(255,255,255,0.7)',
		fontSize: 12,
		fontFamily: 'Montserrat',
		marginBottom: 10,
	},
	fxMainRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 6,
	},
	fxPairLeft: {
		color: '#fff',
		fontSize: 22,
		fontFamily: 'Montserrat',
		fontWeight: '700',
	},
	fxPairRight: {
		color: '#fff',
		fontSize: 22,
		fontFamily: 'Montserrat',
		fontWeight: '700',
	},
	fxRate: {
		color: 'rgba(255,255,255,0.85)',
		fontSize: 16,
		fontFamily: 'Montserrat',
	},
	fxDeltaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginTop: 6,
		marginBottom: 8,
	},
	fxDeltaText: {
		color: '#00FF8A',
		fontSize: 13,
		fontFamily: 'Montserrat',
		fontWeight: '600',
	},
	fxHintRow: {
		marginTop: 16,
		flexDirection: 'row',
		alignItems: 'flex-end',
		justifyContent: 'space-between',
	},
	fxHintText: {
		color: 'rgba(255,255,255,0.7)',
		fontSize: 13,
		fontFamily: 'Montserrat',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	logoCircle: {
		width: 64,
		height: 64,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 32,
	},
	logoImage: { width: 64, height: 64, resizeMode: 'contain', borderRadius: 32 },
	info: { flex: 1, marginLeft: 12 },
	title: {
		color: '#fff',
		fontSize: 14,
		fontFamily: 'Montserrat',
		fontWeight: '600',
	},
	source: {
		color: 'rgba(255,255,255,0.6)',
		fontSize: 11,
		fontFamily: 'Montserrat',
		marginTop: 2,
	},
	price: {
		color: '#fff',
		fontSize: 14,
		fontFamily: 'Montserrat',
		fontWeight: '600',
	},
	date: { color: '#ccc', fontSize: 10, fontFamily: 'Montserrat' },
	divider: {
		height: 1,
		backgroundColor: 'rgba(255,255,255,0.08)',
		marginBottom: 12,
	},
	footer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	period: {
		color: 'rgba(255,255,255,0.7)',
		fontSize: 11,
		fontFamily: 'Montserrat',
	},
	label: { color: '#ccc', fontSize: 10, fontFamily: 'Montserrat' },
	growth: {
		color: '#00FF8A',
		fontSize: 18,
		fontFamily: 'Montserrat',
		fontWeight: '600',
	},
	fxRow: {
		flexDirection: 'row',
		gap: 20,
	},
	fxCurrency: {
		color: '#fff',
		fontSize: 18,
	},
})

export default TradeCard
