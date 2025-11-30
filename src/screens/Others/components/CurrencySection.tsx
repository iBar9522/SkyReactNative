import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
} from 'react-native'

const CurrencySection = () => (
	<View style={styles.currencySection}>
		<View style={styles.currencyHeader}>
			<Text style={styles.currencyTitle}>Курсы валют</Text>
			<TouchableOpacity>
				<Text style={styles.viewAllText}>Смотреть все</Text>
			</TouchableOpacity>
		</View>

		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			style={styles.currencyCards}
		>
			<View style={styles.currencyCard}>
				<View style={styles.currencyPair}>
					<Text style={styles.currencyText}>KZT</Text>
					<View style={styles.exchangeIcon}>
						<Text style={styles.exchangeArrows}>⇄</Text>
					</View>
					<Text style={styles.currencyText}>USD</Text>
				</View>
				<View style={styles.currencyRates}>
					<View style={styles.rateRow}>
						<Text style={styles.rateLabel}>Покупка</Text>
						<Text style={styles.rateValue}>500.5 ₸</Text>
					</View>
					<View style={styles.rateRow}>
						<Text style={styles.rateLabel}>Продажа</Text>
						<Text style={styles.rateValue}>505.4 ₸</Text>
					</View>
				</View>
			</View>

			<View style={styles.currencyCard}>
				<View style={styles.currencyPair}>
					<Text style={styles.currencyText}>KZT</Text>
					<View style={styles.exchangeIcon}>
						<Text style={styles.exchangeArrows}>⇄</Text>
					</View>
					<Text style={styles.currencyText}>EUR</Text>
				</View>
				<View style={styles.currencyRates}>
					<View style={styles.rateRow}>
						<Text style={styles.rateLabel}>Покупка</Text>
						<Text style={styles.rateValue}>629 ₸</Text>
					</View>
					<View style={styles.rateRow}>
						<Text style={styles.rateLabel}>Продажа</Text>
						<Text style={styles.rateValue}>632.5 ₸</Text>
					</View>
				</View>
			</View>

			<View style={styles.currencyCard}>
				<View style={styles.currencyPair}>
					<Text style={styles.currencyText}>RUB</Text>
					<View style={styles.exchangeIcon}>
						<Text style={styles.exchangeArrows}>⇄</Text>
					</View>
					<Text style={styles.currencyText}>USD</Text>
				</View>
				<View style={styles.currencyRates}>
					<View style={styles.rateRow}>
						<Text style={styles.rateLabel}>Покупка</Text>
						<Text style={styles.rateValue}>80.01 ₽</Text>
					</View>
					<View style={styles.rateRow}>
						<Text style={styles.rateLabel}>Продажа</Text>
						<Text style={styles.rateValue}>79.71 ₽</Text>
					</View>
				</View>
			</View>
		</ScrollView>
	</View>
)

const styles = StyleSheet.create({
	currencySection: {
		marginBottom: 24,
	},
	currencyHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
		paddingHorizontal: 8,
	},
	currencyTitle: {
		color: 'white',
		fontSize: 18,
		fontWeight: '600',
	},
	viewAllText: {
		color: '#9ca3af',
		fontSize: 14,
	},
	currencyCards: {
		flexDirection: 'row',
	},
	currencyCard: {
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
		borderRadius: 16,
		padding: 16,
		marginRight: 12,
		minWidth: 140,
	},
	currencyPair: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 16,
	},
	currencyText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
	exchangeIcon: {
		marginHorizontal: 8,
	},
	exchangeArrows: {
		color: 'white',
		fontSize: 16,
	},
	currencyRates: {
		gap: 8,
	},
	rateRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	rateLabel: {
		color: '#9ca3af',
		fontSize: 12,
	},
	rateValue: {
		color: 'white',
		fontSize: 12,
		fontWeight: '500',
	},
})
export default CurrencySection
