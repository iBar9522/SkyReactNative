import React from 'react'
import {
	ImageBackground,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	Image,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'

import PrimaryButton from '@/components/PrimaryButton'

export default function WelcomeScreen() {
	const navigation = useNavigation<any>()
	const insets = useSafeAreaInsets()

	return (
		<SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
			<ImageBackground
				source={require('../assets/main_background.png')}
				resizeMode='cover'
				style={styles.background}
			>
				<View style={styles.container}>
					<View style={styles.textBlock}>
						<Image
							source={require('../assets/logo_sbi.png')}
							style={styles.logo}
							resizeMode='contain'
						/>
						<Text style={styles.title}>
							Твои цели. Твой рост.{'\n'}Наша надёжность
						</Text>
						<Text style={styles.subtitle}>
							Возьми под контроль свои финансы
						</Text>
					</View>

					<View
						style={[styles.buttonBlock, { paddingBottom: insets.bottom || 32 }]}
					>
						<PrimaryButton
							title='Зарегистрироваться'
							onPress={() => navigation.navigate('Register')}
						/>

						<TouchableOpacity onPress={() => navigation.navigate('Login')}>
							<Text style={styles.linkText}>Уже есть аккаунт?</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ImageBackground>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: 'black',
	},
	background: {
		flex: 1,
		justifyContent: 'center',
	},
	container: {
		flex: 1,
		justifyContent: 'space-between',
		paddingHorizontal: 24,
		paddingVertical: 32,
	},
	textBlock: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	logo: {
		width: 300,
		height: 300,
		marginBottom: 24,
	},
	buttonBlock: {},
	title: {
		fontFamily: 'Montserrat',
		color: 'rgba(255, 255, 255, 1)',
		fontSize: 26,
		fontWeight: 'bold',
		lineHeight: 31.2,
		letterSpacing: 1,
		textAlign: 'center',
		marginTop: 16,
	},
	subtitle: {
		fontFamily: 'Montserrat',
		color: 'white',
		fontSize: 16,
		fontWeight: '500',
		lineHeight: 22,
		textAlign: 'center',
		marginTop: 10,
	},
	linkText: {
		fontFamily: 'Montserrat',
		color: 'white',
		fontSize: 14,
		fontWeight: '600',
		lineHeight: 22,
		textAlign: 'center',
		textDecorationLine: 'underline',
		marginTop: 16,
	},
})
