import React from 'react'
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Ionicons from 'react-native-vector-icons/Ionicons'

interface Props {
	total: number
	current: number
	onBack?: () => void
}

const StepIndicator = ({ total, current, onBack }: Props) => {
	return (
		<View style={styles.wrapper}>
			{onBack && (
				<TouchableOpacity style={styles.backButton} onPress={onBack}>
					<Icon name='arrow-back' size={24} color='#fff' />
				</TouchableOpacity>
			)}
			<View style={styles.container}>
				<View style={styles.progressBar}>
					<View
						style={[
							styles.progress,
							{ width: `${((current + 1) / total) * 100}%` },
						]}
					/>
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingTop: 16,
		marginTop: 30,
	},
	backButton: {
		marginRight: 16,
	},
	backIcon: {
		width: 24,
		height: 24,
	},
	container: {
		flex: 1,
	},
	progressBar: {
		height: 16,
		borderRadius: 12,
		backgroundColor: 'rgb(51, 118, 246)',
		borderWidth: 1,
		borderColor: 'rgba(0, 0, 0, 0.15)',
		shadowColor: 'black',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
		elevation: 1,
		overflow: 'hidden',
	},
	progress: {
		height: 14,
		backgroundColor: 'rgb(250, 250, 250)',
		borderRadius: 12,
		borderTopWidth: 1,
		borderTopColor: 'rgba(255, 255, 255, 0.5)',
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(0, 0, 0, 0.25)',
	},
})

export default StepIndicator
