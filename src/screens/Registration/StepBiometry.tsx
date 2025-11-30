import {
	useLazyGetBioguardIframeQuery,
	useCheckBiometricVerificationMutation,
} from '@/api/authApi'
import { RegistrationFormValues } from '@/types/AuthTypes'
import { Buffer } from 'buffer'
import React, { useRef, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import {
	ActivityIndicator,
	Image,
	Modal,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { WebView } from 'react-native-webview'
import Toast from 'react-native-toast-message'
import PrimaryButton from '../../components/PrimaryButton'
import { ensureCamMic } from '@/utils/permissions'
import AsyncStorage from '@react-native-async-storage/async-storage'

const StepBiometry: React.FC<{
	form: UseFormReturn<RegistrationFormValues>
	onNext: () => void
	onBack: () => void
}> = ({ onNext }) => {
	const [open, setOpen] = useState(false)
	const [iframeUrl, setIframeUrl] = useState<string | null>(null)
	const [sessionId, setSessionId] = useState<string | null>(null)
	const [successCb, setSuccessCb] = useState<string | null>(null)
	const [failedCb, setFailedCb] = useState<string | null>(null)
	const [wvKey, setWvKey] = useState<string | number>(0)

	const webRef = useRef<WebView>(null)
	const [trigger, { isLoading }] = useLazyGetBioguardIframeQuery()
	const [checkBiometricVerification] = useCheckBiometricVerificationMutation()

	const b64 = (v: string) => {
		try {
			return Buffer.from(v, 'base64').toString('utf8')
		} catch {
			return ''
		}
	}
	const qp = (url: string, key: string) => {
		const m = url.match(new RegExp(`[?&]${key}=([^&#]+)`))
		return m ? decodeURIComponent(m[1]) : ''
	}

	const reset = async () => {
		setOpen(false)
		setIframeUrl(null)
		setSuccessCb(null)
		setFailedCb(null)

		if (sessionId) {
			try {
				const res = await checkBiometricVerification({ sessionId }).unwrap()

				if (res?.verified) {
					await AsyncStorage.setItem('pkbResponse', JSON.stringify(res))
					onNext()
				} else {
					Toast.show({
						type: 'error',
						text1: 'Биометрия не подтверждена',
						text2: 'Попробуйте снова.',
					})
				}
			} catch (err) {
				Toast.show({
					type: 'error',
					text1: 'Ошибка',
					text2: 'Не удалось проверить результат биометрии.',
				})
			}
		}
	}

	const handleStart = async () => {
		try {
			const ok = await ensureCamMic()
			if (!ok) return

			const res = await trigger().unwrap()
			const url = res.iframeUrl
			const session = res.sessionId
			const successUrl = b64(qp(url, 'successurl'))
			const failedUrl = b64(qp(url, 'failedurl'))

			setSuccessCb(successUrl || null)
			setFailedCb(failedUrl || null)
			setIframeUrl(url)
			setSessionId(session)

			if (res.sessionId) {
				setWvKey(res.sessionId)
			} else {
				setWvKey(Date.now().toString())
			}

			setOpen(true)
		} catch {
			Toast.show({
				type: 'error',
				text1: 'Ошибка',
				text2: 'Не удалось получить ссылку для биометрии.',
			})
		}
	}

	const handleNav = (url: string) => {
		if (successCb && url.startsWith(successCb)) {
			reset()
			return false
		}
		if (failedCb && url.startsWith(failedCb)) {
			reset()
			Toast.show({
				type: 'error',
				text1: 'Биометрия не пройдена',
				text2: 'Попробуйте снова.',
			})
			return false
		}
		return true
	}

	return (
		<View style={styles.container}>
			<View>
				<Text style={styles.title}>
					Пройдите биометрию, чтобы открыть счёт.
				</Text>
				<Text style={styles.subtitle}>
					Убедитесь, что у приложения есть доступ к камере/микрофону.
				</Text>
			</View>

			<Image
				source={require('../../assets/face-id.png')}
				style={styles.image}
				resizeMode='contain'
			/>
			<Text style={styles.instruction}>Следуйте инструкциям на экране.</Text>

			<View style={{ width: '100%', gap: 10 }}>
				<PrimaryButton
					title={'Начать'}
					loading={isLoading}
					onPress={handleStart}
				/>
				<PrimaryButton title={'Пропустить'} onPress={() => onNext()} />
			</View>

			<Modal
				visible={open && !!iframeUrl}
				animationType='slide'
				presentationStyle='fullScreen'
				onRequestClose={reset}
			>
				<StatusBar barStyle='light-content' backgroundColor='#0B2A66' />
				<View style={styles.modalContainer}>
					<View style={styles.webHeader}>
						<Text style={styles.headerTitle}>Биометрия</Text>
						<TouchableOpacity onPress={reset}>
							<Icon name='close' size={26} color='#fff' />
						</TouchableOpacity>
					</View>

					{iframeUrl && (
						<WebView
							key={wvKey}
							ref={webRef}
							source={{ uri: iframeUrl }}
							startInLoadingState
							renderLoading={() => (
								<ActivityIndicator size='large' style={{ marginTop: 20 }} />
							)}
							javaScriptEnabled
							domStorageEnabled
							allowsInlineMediaPlayback
							onShouldStartLoadWithRequest={req => handleNav(req.url)}
							onNavigationStateChange={state => handleNav(state.url)}
							mediaPlaybackRequiresUserAction={false}
							mediaCapturePermissionGrantType='grant'
							setSupportMultipleWindows={false}
							onError={() =>
								Toast.show({ type: 'error', text1: 'Ошибка WebView' })
							}
							onHttpError={() =>
								Toast.show({ type: 'error', text1: 'Сервис недоступен' })
							}
							style={styles.webView}
						/>
					)}
				</View>
			</Modal>
		</View>
	)
}

export default StepBiometry

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 36,
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	title: {
		fontFamily: 'Montserrat',
		fontSize: 23,
		color: '#fff',
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 12,
	},
	subtitle: {
		fontFamily: 'Montserrat',
		fontSize: 14,
		color: '#fff',
		textAlign: 'center',
		marginBottom: 20,
	},
	instruction: {
		fontFamily: 'Montserrat',
		fontSize: 14,
		color: '#fff',
		textAlign: 'center',
		marginVertical: 12,
	},
	image: { width: 140, height: 140, tintColor: '#fff' },

	modalContainer: {
		flex: 1,
		paddingTop: StatusBar.currentHeight || 50,
	},
	webView: {
		flex: 1,
	},
	webHeader: {
		height: 52,
		paddingHorizontal: 16,
		backgroundColor: '#0B2A66',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
})
