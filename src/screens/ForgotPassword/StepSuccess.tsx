import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Feather from 'react-native-vector-icons/Feather'
import PrimaryButton from '@/components/PrimaryButton'

const StepSuccess = () => {
	const navigation = useNavigation<any>()

	return (
		<View style={styles.container}>
			<View style={styles.iconWrapper}>
				<Feather name='check-circle' size={72} color='#4BB543' />
			</View>
			<View>
				<Text style={styles.title}>Пароль успешно обновлён!</Text>
				<Text style={styles.subtitle}>
					Откройте приложение и продолжайте управлять своими инвестициями.
				</Text>
			</View>

			<PrimaryButton
				title='Войти'
				onPress={() => navigation.navigate('Login')}
			/>
		</View>
	)
}

export default StepSuccess

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 36,
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 24,
	},
	iconWrapper: {
		marginBottom: 24,
	},
	title: {
		fontSize: 26,
		fontFamily: 'Montserrat',
		fontWeight: '700',
		color: '#fff',
		marginBottom: 12,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 14,
		fontFamily: 'Montserrat',
		lineHeight: 18,
		fontWeight: 400,
		color: '#fff',
		textAlign: 'center',
		marginBottom: 32,
	},
	button: {
		backgroundColor: '#1A73E8',
		paddingVertical: 16,
		paddingHorizontal: 32,
		borderRadius: 12,
	},
	buttonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
		fontFamily: 'Montserrat',
	},
})
