import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native'
import CountryPicker, { CountryCode } from 'react-native-country-picker-modal'
import FormInput from './FormInput'
import { Controller } from 'react-hook-form'
import { formatPhoneNumber } from '@/utils/formats'
import { getWidthsByCountryCode } from '@/utils/getWidthByCountryCode'

type Props = {
	name: string
	control: any
	error?: string
	defaultCountry?: CountryCode
	style?: ViewStyle
	inputStyle?: TextStyle
}

const PhoneInputWithCountry: React.FC<Props> = ({
	name,
	control,
	defaultCountry = 'KZ',
	style,
	inputStyle,
}) => {
	const [countryCode, setCountryCode] = useState<CountryCode>(defaultCountry)
	const [callingCode, setCallingCode] = useState('+7')
	const [localNumber, setLocalNumber] = useState('')
	const [initialized, setInitialized] = useState(false)

	return (
		<Controller
			control={control}
			name={name}
			rules={{
				required: 'Введите номер телефона',
				validate: (value: string) => {
					const digits = value.replace(/\D/g, '')
					return digits.length >= 10 || 'Введите корректный номер'
				},
			}}
			render={({ field: { onChange, value }, fieldState: { error } }) => {
				useEffect(() => {
					const clean = localNumber.replace(/\D/g, '')
					const full = callingCode + clean
					if (initialized) {
						onChange(full)
					} else {
						setInitialized(true)
					}
				}, [localNumber, callingCode])

				const formattedPhone = formatPhoneNumber(localNumber)
				const { flag, input } = getWidthsByCountryCode(callingCode)

				return (
					<View style={[styles.wrapper, style]}>
						<View style={styles.row}>
							<View style={[styles.flagWrapper, { width: flag as any }]}>
								<CountryPicker
									countryCode={countryCode}
									withFlag
									withCallingCode
									withFilter
									onSelect={country => {
										setCountryCode(country.cca2 as CountryCode)
										setCallingCode(`+${country.callingCode?.[0]}`)
									}}
								/>
								<Text style={styles.code}>{callingCode}</Text>
							</View>
							<View style={{ width: input as any }}>
								<FormInput
									placeholder='777 777 77 77'
									keyboardType='phone-pad'
									maxLength={13}
									name={name}
									value={formattedPhone}
									onChangeText={text => {
										const clean = text.replace(/\D/g, '')
										setLocalNumber(clean)
									}}
									style={[styles.input, inputStyle]}
									error={error?.message}
								/>
							</View>
						</View>
						{error && <Text style={styles.error}>{error.message}</Text>}
					</View>
				)
			}}
		/>
	)
}

export default PhoneInputWithCountry

const styles = StyleSheet.create({
	wrapper: {
		marginBottom: 12,
		width: '100%',
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		height: 50,
		width: '100%',
	},
	flagWrapper: {
		height: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 10,
		borderRadius: 12,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderColor: 'rgba(255, 255, 255, 0.2)',
		borderWidth: 1,
		marginRight: 10,
		marginTop: -12,
	},
	code: {
		color: '#fff',
		marginLeft: 4,
		fontSize: 16,
		fontFamily: 'Montserrat',
	},
	input: {},
	error: {
		color: '#ff7a7a',
		fontSize: 13,
		fontFamily: 'Montserrat',
	},
})
