import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

export default function HomeScreen() {
	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#091F44', '#3376F6']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				style={StyleSheet.absoluteFill}
			/>

			<View style={styles.overlay} />

			<View style={styles.content}>
				<Text style={styles.text}>Ордера</Text>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'relative',
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.2)',
	},
	content: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	text: {
		color: '#fff',
		fontSize: 24,
		fontFamily: 'Montserrat',
		fontWeight: 'bold',
	},
})
