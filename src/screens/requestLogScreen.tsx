import React from 'react'
import {
	SafeAreaView,
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import NetworkLoggerScreen from 'react-native-network-logger'

const NetworkLogsScreen = () => {
	const navigation = useNavigation()

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Text style={styles.backButton}>← Назад</Text>
				</TouchableOpacity>
				<Text style={styles.title}>Сетевые запросы</Text>
				<View style={{ width: 60 }} />
			</View>

			<View style={{ flex: 1 }}>
				<NetworkLoggerScreen />
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 12,
		backgroundColor: '#f0f0f0',
	},
	backButton: {
		fontSize: 16,
		fontFamily: 'Montserrat',
		color: '#007AFF',
	},
	title: {
		fontSize: 16,
		fontWeight: 'bold',
	},
})

export default NetworkLogsScreen
