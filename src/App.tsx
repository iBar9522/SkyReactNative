import { NavigationContainer } from '@react-navigation/native'
import React, { useEffect } from 'react'
import {
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
} from 'react-native'
import { Provider } from 'react-redux'

import { startNetworkLogging } from 'react-native-network-logger'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast, {
	ToastConfig,
	ToastConfigParams,
} from 'react-native-toast-message'
import { AuthProvider } from './contexts/AuthContext'
import { useLocation } from './hooks/useLocation'
import AppNavigator from './navigation/AppNavigator'
import { navigationRef } from './services/NavigationService'
import { store } from './store/store'
import SuccessIcon from '@/assets/success_toast.svg'
import InfoIcon from '@/assets/info_toast.svg'
import ErrorIcon from '@/assets/error_toast.svg'
import SplashScreen from 'react-native-splash-screen'

if (__DEV__) {
	const originalFetch = global.fetch
	global.fetch = async (...args) => {
		const response = await originalFetch(...args)
		console.log('[fetch]', args[0])
		return response
	}

	startNetworkLogging({ ignoredUrls: ['symbolicate'] })
}

export const toastConfig: ToastConfig = {
	success: (props: ToastConfigParams<any>) => (
		<View style={[styles.toastBase, styles.toastSuccess]}>
			<View style={styles.iconWrapper}>
				<SuccessIcon width={22} height={22} />
			</View>
			<View style={styles.textWrapper}>
				<Text style={styles.title}>{props.text1}</Text>
				{props.text2 ? (
					<Text style={styles.subtitle}>{props.text2}</Text>
				) : null}
			</View>
		</View>
	),

	info: (props: ToastConfigParams<any>) => (
		<View style={[styles.toastBase, styles.toastInfo]}>
			<View style={styles.iconWrapper}>
				<InfoIcon width={22} height={22} />
			</View>
			<View style={styles.textWrapper}>
				<Text style={styles.title}>{props.text1}</Text>
				{props.text2 ? (
					<Text style={styles.subtitle}>{props.text2}</Text>
				) : null}
			</View>
		</View>
	),

	error: (props: ToastConfigParams<any>) => (
		<View style={[styles.toastBase, styles.toastError]}>
			<View style={styles.iconWrapper}>
				<ErrorIcon width={22} height={22} />
			</View>
			<View style={styles.textWrapper}>
				<Text style={styles.title}>{props.text1}</Text>
				{props.text2 ? (
					<Text style={styles.subtitle}>{props.text2}</Text>
				) : null}
			</View>
		</View>
	),
}

function App() {
	const isDarkMode = useColorScheme() === 'dark'
	const location = useLocation()

	useEffect(() => {
		setTimeout(() => {
			SplashScreen.hide()
		}, 700)
	}, [])

	return (
		<SafeAreaProvider>
			<Provider store={store}>
				<AuthProvider>
					<View style={{ flex: 1 }}>
						<NavigationContainer ref={navigationRef}>
							<StatusBar
								barStyle={isDarkMode ? 'light-content' : 'dark-content'}
							/>
							<AppNavigator />
						</NavigationContainer>
						<Toast topOffset={60} config={toastConfig} />
						<TouchableOpacity
							onPress={() => navigationRef.navigate('RequestLog')}
							style={styles.debugButton}
						>
							<Text style={styles.debugButtonText}>📤</Text>
						</TouchableOpacity>
					</View>
				</AuthProvider>
			</Provider>
		</SafeAreaProvider>
	)
}

const styles = StyleSheet.create({
	debugButton: {
		position: 'absolute',
		bottom: 100,
		left: 10,
		backgroundColor: '#000000aa',
		borderRadius: 25,
		padding: 12,
		zIndex: 999,
	},
	debugButtonText: {
		color: '#fff',
		fontSize: 20,
	},
	toastBase: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 12,
		marginHorizontal: 16,
		paddingHorizontal: 14,
		paddingVertical: 12,
		elevation: 4,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 5,
		shadowOffset: { width: 0, height: 3 },
	},
	toastSuccess: {
		backgroundColor: '#F2FFF7',
		borderWidth: 1,
		borderColor: '#2BB67333',
	},
	toastInfo: {
		backgroundColor: '#F3F7FF',
		borderWidth: 1,
		borderColor: '#007AFF33',
	},
	toastError: {
		backgroundColor: '#FFF5F4',
		borderWidth: 1,
		borderColor: '#E9423533',
	},
	iconWrapper: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 10,
	},
	textWrapper: {
		flexShrink: 1,
	},
	title: {
		fontSize: 14,
		fontWeight: '600',
		color: '#1D1D1F',
		marginBottom: 2,
	},
	subtitle: {
		fontSize: 13,
		color: '#5E5E5E',
	},
})

export default App
