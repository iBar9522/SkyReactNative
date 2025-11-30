import React from 'react'
import {
	Image,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	TouchableOpacity,
	TouchableWithoutFeedback,
} from 'react-native'

import {
	View,
	TextInput,
	Text,
	StyleSheet,
	TextInputProps,
	TextStyle,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

interface FormInputProps extends TextInputProps {
	label?: string
	labelStyle?: TextStyle
	error?: string
	name?: string
	search?: boolean
	disabled?: boolean
	isFilter?: boolean
	onPressFilter?: () => void
	required?: boolean
	autoComplete?:
		| 'off'
		| 'username'
		| 'password'
		| 'email'
		| 'name'
		| 'tel'
		| 'street-address'
		| 'postal-code'
		| 'cc-number'
		| 'cc-csc'
		| 'cc-exp'
		| 'cc-exp-month'
		| 'cc-exp-year'
	passwordRules?: string
	textContentType?:
		| 'none'
		| 'URL'
		| 'addressCity'
		| 'addressCityAndState'
		| 'addressState'
		| 'countryName'
		| 'creditCardNumber'
		| 'emailAddress'
		| 'familyName'
		| 'fullStreetAddress'
		| 'givenName'
		| 'jobTitle'
		| 'location'
		| 'middleName'
		| 'name'
		| 'namePrefix'
		| 'nameSuffix'
		| 'nickname'
		| 'organizationName'
		| 'postalCode'
		| 'streetAddressLine1'
		| 'streetAddressLine2'
		| 'sublocality'
		| 'telephoneNumber'
		| 'username'
		| 'password'
		| 'newPassword'
		| 'oneTimeCode'
}

const FormInput: React.FC<FormInputProps> = ({
	label,
	labelStyle,
	error,
	style,
	name,
	search,
	disabled,
	isFilter,
	onPressFilter,
	autoComplete,
	required,
	passwordRules,
	textContentType,
	...props
}) => {
	return (
		<View style={styles.wrapper}>
			{label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

			<TextInput
				{...props}
				autoComplete={autoComplete}
				passwordRules={passwordRules}
				textContentType={textContentType}
				style={[styles.input, error && { borderColor: '#ff7a7a' }, style]}
				placeholderTextColor='rgba(255, 255, 255, 0.5)'
				editable={!disabled}
				showSoftInputOnFocus={!disabled}
				caretHidden={disabled}
			/>
			{search && (
				<Image
					source={require('@/assets/search.png')}
					style={[styles.icon, { right: isFilter ? 44 : 14 }]}
				/>
			)}

			{isFilter && (
				<TouchableOpacity
					style={[styles.icon, { right: search ? 14 : 24 }]}
					onPress={onPressFilter}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<Icon name='filter' size={20} color='rgba(255,255,255,0.3)' />
				</TouchableOpacity>
			)}

			{!!error && name !== 'phone' && <Text style={styles.error}>{error}</Text>}
		</View>
	)
}

export default FormInput

const styles = StyleSheet.create({
	wrapper: {
		marginBottom: 12,
		position: 'relative',
	},
	label: {
		fontFamily: 'Montserrat',
		color: '#fff',
		fontSize: 14,
		marginBottom: 6,
		marginLeft: 4,
	},
	input: {
		width: '100%',
		height: 50,
		borderRadius: 10,
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		color: '#fff',

		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)',

		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	error: {
		color: '#ff7a7a',
		fontFamily: 'Montserrat',
		fontSize: 12,
		marginTop: 4,
		marginLeft: 4,
	},
	icon: {
		position: 'absolute',
		top: '60%',
		right: 14,
		transform: [{ translateY: -15 }],
		width: 18,
		height: 18,
	},
})
