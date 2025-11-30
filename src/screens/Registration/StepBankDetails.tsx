import { useGetBanksQuery } from '@/api/utilsApi'
import { RegistrationFormValues } from '@/types/AuthTypes'
import React, { useEffect } from 'react'
import { Controller, UseFormReturn } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'
import FormInput from '../../components/FormInput'
import PrimaryButton from '../../components/PrimaryButton'
import Select from '../../components/Select'

const StepBankDetails: React.FC<{
	form: UseFormReturn<RegistrationFormValues>
	onNext: () => void
	onBack: () => void
}> = ({ form, onNext }) => {
	const { control, handleSubmit, watch, setValue, clearErrors } = form

	const { data: banks = [], isLoading: isBanksLoading } = useGetBanksQuery()
  
	const selectedBankBic = watch('bankBic')
	const isForeignBank = selectedBankBic === "FOREIGNB"

	useEffect(() => {
		if (!isForeignBank) {
		
			clearErrors(['foreignBankSwift', 'bankName'])
			setValue('foreignBankSwift', '')
		  setValue('bankName', banks.find(bank => bank.bic === selectedBankBic)?.name || '')
		} else if (isForeignBank && selectedBankBic === "FOREIGNB") {
			setValue('bankName', '')
		}
		
	}, [isForeignBank, clearErrors, setValue, selectedBankBic])

	const onSubmit = (_data: RegistrationFormValues) => {
		onNext()
	}

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>Банковские реквизиты</Text>
         	
				<Controller
					name='bankBic'
					control={control}
					rules={{ required: 'Выберите банк' }}
					render={({ field: { value, onChange }, fieldState: { error } }) => (
						<View style={styles.selectWrapper}>
							<Select
								placeholder='Наименование банка'
								value={value}
								onSelect={onChange}
								options={banks.map(bank => ({
									label: bank.name.replace(/["\\]/g, ''),
									value: bank.bic,
								}))}
							/>
							{!!error && <Text style={styles.error}>{error.message}</Text>}
						</View>
					)}
				/>

				<Controller
					name='accountNumber'
					control={control}
					rules={{ required: 'Введите номер счета' }}
					render={({ field: { value, onChange }, fieldState: { error } }) => (
						<FormInput
							placeholder='Номер счета'
							value={value}
							onChangeText={onChange}
							keyboardType='default'
							error={error?.message}
						/>
					)}
				/>

				<Controller
					name="bankName"
					control={control}
					rules={{ 
						required: isForeignBank ? "Введите название банка" : false
					}}
					render={({ field: { value, onChange }, fieldState: { error } }) => (
						<View style={[styles.fieldContainer, !isForeignBank && styles.hiddenField]}>
							<FormInput
								placeholder="Название банка"
								value={value}
								onChangeText={onChange}
								error={isForeignBank ? error?.message : undefined}
							/>
						</View>
					)}
				/>

				<Controller
					name="foreignBankSwift"
					control={control}
					rules={{ 
						required: isForeignBank ? "Введите SWIFT код" : false
					}}
					render={({ field: { value, onChange }, fieldState: { error } }) => (
						<View style={[styles.fieldContainer, !isForeignBank && styles.hiddenField]}>
							<FormInput
								placeholder="SWIFT"
								value={value}
								onChangeText={onChange}
								autoCapitalize="characters"
								error={isForeignBank ? error?.message : undefined}
							/>
						</View>
					)}
				/>
			</View>

			<PrimaryButton
				title='Продолжить'
				style={styles.actionButton}
				onPress={handleSubmit(onSubmit)}
			/>
		</View>
	)
}

export default StepBankDetails

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 36,
		paddingBottom: 20,
		justifyContent: 'space-between',
	},
	content: { gap: 12 },
	title: {
		fontSize: 20,
		fontFamily: 'Montserrat',
		fontWeight: 'bold',
		color: '#fff',
	},
	label: {
		fontSize: 14,
		fontFamily: 'Montserrat',
		color: '#fff',
	},
	switchRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	actionButton: { marginBottom: 15 },
	selectWrapper: {
		marginBottom: 12,
	},
	error: {
		color: '#ff7a7a',
		fontFamily: 'Montserrat',
		fontSize: 12,
		marginTop: 4,
		marginLeft: 4,
	},
	fieldContainer: {
		overflow: 'hidden',
	},
	hiddenField: {
		height: 0,
		opacity: 0,
		marginBottom: 0,
	},
})