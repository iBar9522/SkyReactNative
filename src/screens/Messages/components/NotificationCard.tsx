import React from 'react'
import {
	Pressable,
	View,
	Text,
	Image,
	StyleSheet,
	ImageSourcePropType,
} from 'react-native'

type Props = {
	title: string
	time: string
	icon: ImageSourcePropType
	unread?: boolean
	onPress?: () => void
	style?: object
}

const NotificationCard: React.FC<Props> = ({
	title,
	time,
	icon,
	unread,
	onPress,
	style,
}) => (
	<Pressable
		onPress={onPress}
		style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }, style]}
	>
		<View style={styles.leftIcon}>
			<Image
				source={require('@/assets/notification_icon.png')}
				style={{ width: 24, height: 24, borderRadius: 4 }}
				resizeMode='contain'
			/>
		</View>
		<View style={{ flex: 1 }}>
			<Text style={[styles.title, unread && { fontWeight: '700' }]}>
				{title}
			</Text>
			<Text style={styles.time}>{time}</Text>
		</View>
	</Pressable>
)

export default NotificationCard

const styles = StyleSheet.create({
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 16,
		paddingHorizontal: 16,
		borderRadius: 18,
		shadowColor: '#000',
		shadowOpacity: 0.15,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 6 },
	},
	leftIcon: {
		width: 44,
		height: 44,
		borderRadius: 32,
		backgroundColor: 'rgba(255,255,255,1)',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 14,
	},
	title: {
		color: '#fff',
		fontFamily: 'Montserrat',
		fontSize: 13,
		lineHeight: 17,
		fontWeight: 500,
		marginBottom: 4,
	},
	time: {
		color: 'rgba(255,255,255,0.7)',
		fontFamily: 'Montserrat',
		fontSize: 11,
		fontWeight: 400,
		lineHeight: 13,
	},
})
