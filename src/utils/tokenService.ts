import * as Keychain from 'react-native-keychain'

export type AuthTokens = {
	accessToken: string
	refreshToken: string
}

const TOKEN_KEY = 'token'

export const tokenService = {
	async getTokens(): Promise<AuthTokens | null> {
		const creds = await Keychain.getGenericPassword()
		if (!creds) return null

		try {
			const tokens = JSON.parse(creds.password)
			return tokens
		} catch {
			return null
		}
	},

	async setTokens(tokens: AuthTokens): Promise<void> {
		await Keychain.setGenericPassword(TOKEN_KEY, JSON.stringify(tokens))
	},

	async resetTokens(): Promise<void> {
		await Keychain.resetGenericPassword()
	},
}
