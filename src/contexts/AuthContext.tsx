import { useLoginByPhoneMutation, useLogoutMutation } from '@/api/authApi'
import { useLazyGetUserProfileQuery } from '@/api/profileApi'
import { tokenService } from '@/utils/tokenService'
import React, {
	createContext,
	ReactNode,
	useContext,
	useState,
	useEffect,
	useRef,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { initializeFCM, listenForTokenRefresh } from '@/services/FcmService'
import { pinStorage } from '@/services/PinStorageService'
import { navigate } from '@/services/NavigationService'
import { biometricStorage } from '@/services/BiometricService'

interface LoginData {
	phone: string
	password: string
}

interface AuthContextType {
	user: any | null
	login: (data: LoginData) => Promise<void>
	logout: () => Promise<void>
	refetchUser: () => void
	getInitials: () => string
	setUser: (user: any | null) => void
	isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext)
	if (!context) throw new Error('AuthContext not found')
	return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<any | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [loginMutation] = useLoginByPhoneMutation()
	const [logoutMutation] = useLogoutMutation()
	const [triggerGetUserProfile] = useLazyGetUserProfileQuery()
	const [fcmToken, setFcmToken] = useState<string>('')
	const fcmInitialized = useRef(false)
	const didInitRef = useRef(false)

	const refetchUser = async () => {
		try {
			const userData = await triggerGetUserProfile().unwrap()
			setUser(userData)
		} catch (err) {
			console.warn('Ошибка при refetchUser:', err)
		}
	}

	useEffect(() => {
		let unsubscribe: (() => void) | undefined

		const initFcm = async () => {
			try {
				if (fcmInitialized.current) return
				const token = await initializeFCM(data => {
					if (data.sender === 'qualification') {
						refetchUser()
					}
				})

				if (token) {
					await AsyncStorage.setItem('fcmToken', token)
					setFcmToken(token)
				}

				unsubscribe = listenForTokenRefresh(async newToken => {
					setFcmToken(newToken)
					await AsyncStorage.setItem('fcmToken', newToken)
				})

				fcmInitialized.current = true
			} catch (err) {
				console.warn('FCM init error:', err)
			}
		}

		initFcm()

		return () => {
			if (unsubscribe) unsubscribe()
		}
	}, [])

	useEffect(() => {
		const initializeAuth = async () => {
			if (didInitRef.current) return
			didInitRef.current = true

			try {
				setIsLoading(true)
				const tokens = await tokenService.getTokens()

				if (tokens?.accessToken) {
					const userData = await triggerGetUserProfile().unwrap()
					setUser(userData)
				}
			} catch (error) {
				await tokenService.resetTokens()
			} finally {
				setIsLoading(false)
			}
		}

		initializeAuth()
	}, [])

	const login = async (data: LoginData) => {
		const token = fcmToken || (await AsyncStorage.getItem('fcmToken')) || ''
		const res = await loginMutation({
			...data,
			fcmToken: token,
		}).unwrap()

		await tokenService.setTokens({
			accessToken: res.accessToken,
			refreshToken: res.refreshToken,
		})

		const userData = await triggerGetUserProfile().unwrap()
		setUser(userData)
		await AsyncStorage.setItem('lastUserId', userData.id)
	}

	const logout = async () => {
		try {
			const tokens = await tokenService.getTokens()
			const token = fcmToken || (await AsyncStorage.getItem('fcmToken')) || ''

			if (tokens?.refreshToken) {
				await logoutMutation({
					refreshToken: tokens.refreshToken,
					fcmToken: token,
				}).unwrap()
			}
		} catch (error) {
			console.error('Logout failed:', error)
		} finally {
			await tokenService.resetTokens()
			setUser(null)
		}
	}

	const getInitials = () => {
		if (!user) return '??'
		const { firstName, lastName } = user
		const first = firstName?.charAt(0).toUpperCase() || ''
		const last = lastName?.charAt(0).toUpperCase() || ''
		return `${first}${last}`
	}

	const value: AuthContextType = {
		user,
		login,
		logout,
		getInitials,
		refetchUser,
		setUser,
		isLoading,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
