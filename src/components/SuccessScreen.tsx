import React from 'react'
import {
	View,
	Text,
	StyleSheet,
	Image,
	ImageSourcePropType,
	ViewStyle,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import PrimaryButton from '@/components/PrimaryButton'

type Props = {
	title: string
	subtitle?: string
	buttonText: string
	onPress: () => void
	imageSource?: ImageSourcePropType
	gradientColors?: string[]
	containerStyle?: ViewStyle
}

const SuccessScreen: React.FC<Props> = ({
	title,
	subtitle,
	buttonText,
	onPress,
	imageSource = require('@/assets/logo_sbi.png'),
	gradientColors = ['rgb(51, 118, 246)', 'rgb(9, 32, 68)', 'rgb(0, 0, 0)'],
	containerStyle,
}) => {
	return (
		<LinearGradient colors={gradientColors} style={styles.background}>
			<View style={styles.overlay}>
				<View style={[styles.container, containerStyle]}>
					<View>
						<Image
							source={imageSource}
							style={styles.logo}
							resizeMode='contain'
						/>

						<View style={{ marginTop: 20 }}>
							<Text style={styles.title}>{title}</Text>
							{!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
						</View>
					</View>

					<PrimaryButton title={buttonText} onPress={onPress} />
				</View>
			</View>
		</LinearGradient>
	)
}

export default SuccessScreen

const styles = StyleSheet.create({
	background: { flex: 1 },
	overlay: { flex: 1, paddingHorizontal: 24, paddingVertical: 16 },
	container: {
		flex: 1,
		paddingHorizontal: 24,
		paddingVertical: 36,
		marginTop: 70,
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	logo: { width: 350, height: 250 },
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
