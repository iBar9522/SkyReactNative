import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import PrimaryButton from '../../components/PrimaryButton'
import { useNavigation } from '@react-navigation/native'
import LinearGradient from 'react-native-linear-gradient'
import SuccessScreen from '@/components/SuccessScreen'
import { useAuth } from '@/contexts/AuthContext'
import { useLazyGetUserProfileQuery } from '@/api/profileApi'

const StepFinal: React.FC = () => {
	const navigation = useNavigation<any>()
  const { setUser } = useAuth()
  const [triggerGetUserProfile] = useLazyGetUserProfileQuery()
	const handlePress = async () => {

		await new Promise(resolve => setTimeout(resolve, 50))
		const userData = await triggerGetUserProfile().unwrap()
		setUser(userData)
		navigation.reset({
			index: 0,
			routes: [
				{
					name: 'Tabs',
					state: { index: 0, routes: [{ name: 'Home' }] },
				},
			],
		})
	}
	return (
		<SuccessScreen
			title='Спасибо! Вы зарегистрированы!'
			subtitle='Переходите в приложение и начинайте инвестировать!'
			buttonText='К инвестициям'
			onPress={handlePress}
				
		
		/>
	)
}

export default StepFinal

const styles = StyleSheet.create({
	background: {
		flex: 1,
	},
	overlay: {
		flex: 1,
		paddingHorizontal: 24,
		paddingVertical: 16,
	},
	container: {
		flex: 1,
		paddingHorizontal: 24,
		paddingVertical: 36,
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	logo: {
		width: 160,
		height: 160,
	},
	title: {
		fontFamily: 'Montserrat',
		fontSize: 26,
		color: '#fff',
		fontWeight: '700',
		textAlign: 'center',
		marginBottom: 12,
	},
	subtitle: {
		fontFamily: 'Montserrat',
		fontSize: 14,
		fontWeight: '400',
		color: '#fff',
		textAlign: 'center',
	},
})
