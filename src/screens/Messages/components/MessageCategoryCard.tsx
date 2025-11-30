import React from 'react'
import {
	Pressable,
	View,
	Text,
	StyleSheet,
	Image,
	ImageSourcePropType,
	ViewStyle,
	ImageStyle,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

type Badge = { type: 'time'; value: string } | { type: 'count'; value: number }

type Props = {
	title: string
	subtitle?: string
	image: ImageSourcePropType
	onPress?: () => void
	rightBadge?: Badge
	style?: ViewStyle
	imageStyle?: ImageStyle
}

const MessageCategoryCard: React.FC<Props> = ({
	title,
	subtitle,
	image,
	rightBadge,
	onPress,
	style,
	imageStyle,
}) => {
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.shadowWrap,
				pressed && { opacity: 0.96, transform: [{ scale: 0.997 }] },
				style,
			]}
		>
			<View style={styles.card}>
				<LinearGradient
					colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.02)']}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={StyleSheet.absoluteFill}
					pointerEvents='none'
				/>
				<View
					pointerEvents='none'
					style={[
						StyleSheet.absoluteFill,
						{ backgroundColor: 'rgba(255,255,255,0.05)' },
					]}
				/>
				<View
					pointerEvents='none'
					style={[
						StyleSheet.absoluteFill,
						{
							borderRadius: 18,
							borderWidth: StyleSheet.hairlineWidth,
							borderColor: 'rgba(255,255,255,0.10)',
						},
					]}
				/>
				<View style={styles.content}>
					<View style={styles.leftIcon}>
						<Image
							source={image}
							style={[styles.iconImg, imageStyle]}
							resizeMode='contain'
						/>
					</View>

					<View style={styles.texts}>
						<Text style={styles.title}>{title}</Text>
						{!!subtitle && (
							<Text style={styles.subtitle} numberOfLines={1}>
								{subtitle}
							</Text>
						)}
					</View>

					{rightBadge && (
						<View
							style={[
								styles.badge,
								rightBadge.type === 'time' && styles.badgeTime,
							]}
						>
							<Text style={styles.badgeText}>
								{rightBadge.type === 'time'
									? rightBadge.value
									: rightBadge.value}
							</Text>
						</View>
					)}
				</View>
			</View>
		</Pressable>
	)
}

export default MessageCategoryCard

const styles = StyleSheet.create({
	shadowWrap: {
		borderRadius: 18,
		marginBottom: 12,
	},

	card: {
		overflow: 'hidden',
		borderRadius: 18,
	},

	content: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 11,
		paddingHorizontal: 15,
	},

	leftIcon: {
		width: 48,
		height: 48,
		borderRadius: 25,
		marginRight: 14,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: 'rgba(255,255,255,0.10)',
	},
	iconImg: {
		width: 18,
		height: 18,
		tintColor: '#CFE1FF',
	},

	texts: { flex: 1 },
	title: {
		color: '#fff',
		fontFamily: 'Montserrat',
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 2,
	},
	subtitle: {
		color: 'rgba(255,255,255,0.7)',
		fontFamily: 'Montserrat',
		fontSize: 13,
	},

	badge: {
		minWidth: 28,
		height: 28,
		paddingHorizontal: 8,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.12)',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: 'rgba(255,255,255,0.10)',
	},
	badgeTime: { paddingHorizontal: 10 },
	badgeText: {
		color: 'rgba(255,255,255,0.85)',
		fontFamily: 'Montserrat',
		fontSize: 12,
		fontWeight: '600',
	},
})
