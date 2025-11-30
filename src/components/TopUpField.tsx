import Clipboard from '@react-native-clipboard/clipboard'
import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'

type Props = {
	label: string
	value: string
	copyable?: boolean
}

export default function TopUpField({ label, value, copyable = true }: Props) {
	const onCopy = () => {
		Clipboard.setString(value)
		Toast.show({ type: 'success', text1: 'Скопировано' })
	}

	return (
		<View style={styles.wrapper}>
			<Text style={styles.label}>{label}</Text>
			<View style={styles.inputRow}>
				<Text style={styles.value}>{value}</Text>
				{copyable && (
					<TouchableOpacity onPress={onCopy}>
						<Image
							source={require('@/assets/copy.png')}
							style={styles.copyIcon}
							resizeMode='contain'
						/>
					</TouchableOpacity>
				)}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		marginBottom: 12,
	},
	label: {
		color: '#fff',
		fontSize: 14,
		marginBottom: 5,
	},
	inputRow: {
		backgroundColor: 'rgba(255,255,255,0.1)',
		borderRadius: 10,
		minHeight: 50,
		paddingHorizontal: 20,
		paddingVertical: 10,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 50,
	},
	value: {
		color: '#fff',
		fontSize: 16,
		flex: 1,
		marginRight: 8,
	},
	copyIcon: {
		width: 20,
		height: 20,
		tintColor: '#fff',
	},
})
