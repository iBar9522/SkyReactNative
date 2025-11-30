import React from 'react'
import { StyleSheet, SafeAreaView, ScrollView, View, Text, TextInput } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import MenuSection from './components/MenuSection'


const Others = () => {
	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient
				colors={['#091F44', '#3376F6']}
				style={StyleSheet.absoluteFill}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
			/>
     <View style={styles.header}>
			<Text style={styles.title}>Другое</Text>
		 </View>


			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				<MenuSection />
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		padding: 16,
	},
	header: {
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 25,
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		color: 'white',
	},
})

export default Others
