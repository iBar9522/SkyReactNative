import WarningIcon from '@/assets/warning.svg'
import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const QualificationRequired = () => {
	const navigation = useNavigation<any>()

	return (
		<View style={styles.wrapper}>
			<View style={styles.alertBox}>
				<WarningIcon style={styles.alertIcon} />
				<Text style={styles.alertText}>
					Для покупки данной бумаги необходим статус квалифицированного
					инвестора
				</Text>
			</View>
    
			<TouchableOpacity
				style={styles.button}
				activeOpacity={0.8}
				onPress={() => navigation.navigate('QualificationCriteria')}
			>
				<Text style={styles.buttonText}>Подтвердить квалификацию</Text>
			</TouchableOpacity>

			<Text style={styles.hintText}>
				для получения статуса квалифицированного инвестора
			</Text>
		</View>
	)
}

export default QualificationRequired

const styles = StyleSheet.create({
	wrapper: {
		alignItems: 'center',
		borderRadius: 16,
		marginTop: 12,
	},
	alertBox: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderRadius: 16,
		paddingVertical: 14,
		paddingHorizontal: 12,
		marginBottom: 16,
		width: '100%',
	},
	alertIcon: {
		width: 28,
		height: 28,
		marginRight: 12,
	},
	alertText: {
		flex: 1,
		color: '#FFFFFF',
		fontSize: 14,
		lineHeight: 20,
		fontWeight: '500',
	},
	button: {
		width: '100%',
		backgroundColor: '#FFFFFF',
		paddingVertical: 12,
		borderRadius: 12,
		alignItems: 'center',
		marginBottom: 6,
	},
	buttonText: {
		color: '#000000',
		fontSize: 15,
		fontWeight: '600',
	},
	hintText: {
		color: 'rgba(255,255,255,0.7)',
		fontSize: 12,
	},
})
