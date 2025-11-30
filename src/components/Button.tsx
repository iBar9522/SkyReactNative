import React from 'react'
import {
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	ViewStyle,
	TextStyle,
	ImageSourcePropType,
	ImageStyle,
	ActivityIndicator,
	View,
} from 'react-native'

interface ButtonProps {
	title: string
	onPress?: () => void
	icon?: ImageSourcePropType | null
	iconPosition?: 'left' | 'right'
	iconStyle?: ImageStyle
	style?: ViewStyle
	textStyle?: TextStyle
	textSize?: number
	disabled?: boolean
	loading?: boolean
}

export default function Button({
	title,
	onPress,
	icon = null,
	iconPosition = 'left',
	iconStyle,
	style,
	textSize = 12,
	textStyle,
	disabled = false,
	loading = false,
}: ButtonProps) {
	return (
		<TouchableOpacity
			style={[styles.buyButton, style, disabled && styles.disabled]}
			onPress={onPress}
			disabled={disabled}
			activeOpacity={0.8}
		>
			{loading ? (
				<ActivityIndicator size='small' color={'#000'} />
			) : (
				<View style={styles.content}>
					{icon && iconPosition === 'left' && (
						<Image source={icon} style={[styles.icon, iconStyle]} />
					)}

					<Text
						style={[
							styles.buyText,
							textStyle,
							{ fontSize: textSize },
							disabled && styles.disabledText,
						]}
					>
						{title}
					</Text>

					{icon && iconPosition === 'right' && (
						<Image source={icon} style={[styles.icon, iconStyle]} />
					)}
				</View>
			)}
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	buyButton: {
		flexDirection: 'row',
		gap: 10,
		flex: 1,
		height: 55,
		backgroundColor: '#fff',
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	icon: {
		width: 20,
		height: 20,
		resizeMode: 'contain',
	},
	buyText: {
		fontWeight: '600',
		color: '#000',
	},
	disabled: {
		backgroundColor: '#ccc',
		opacity: 0.6,
	},
	disabledText: {
		color: '#666',
	},
})
