import React from 'react'
import {
	Text,
	TouchableOpacity,
	StyleSheet,
	ViewStyle,
	ActivityIndicator,
	Image,
	View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

type Props = {
	title: string
	onPress: () => void
	style?: ViewStyle
	loading?: boolean
	disabled?: boolean
	textStyle?: ViewStyle
	icon?: any
}

const PrimaryButton: React.FC<Props> = ({
	title,
	onPress,
	icon,
	style,
	loading,
	disabled,
	textStyle,
}) => {
	const isDisabled = disabled || loading

	return (
		<TouchableOpacity
			onPress={!isDisabled ? onPress : undefined}
			activeOpacity={0.7}
			disabled={isDisabled}
			style={[styles.button, style, isDisabled && styles.disabledButton]}
		>
			<LinearGradient
				colors={
					isDisabled
						? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
						: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.05)']
				}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.gradient}
			>
				{loading ? (
					<ActivityIndicator color='#fff' size='small' />
				) : (
					<View style={styles.textContainer}>
						{icon && <Image source={icon} style={styles.icon} />}
						<Text style={[styles.text, textStyle]}>{title}</Text>
					</View>
				)}
			</LinearGradient>
		</TouchableOpacity>
	)
}

export default PrimaryButton

const styles = StyleSheet.create({
	button: {
		width: '100%',
		height: 57,
		borderRadius: 10,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
	},
	disabledButton: {
		opacity: 0.5,
	},
	gradient: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 9,
	},
	text: {
		color: '#fff',
		fontWeight: '500',
		fontFamily: 'Montserrat',
		fontSize: 18,
	},
	icon: {
		width: 20,
		height: 20,
		resizeMode: 'contain',
	},
	textContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
})
