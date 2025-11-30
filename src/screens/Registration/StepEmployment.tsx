import { RegistrationFormValues } from '@/types/AuthTypes'
import { ReferenceItem } from '@/types/ReferenceTypes'
import React, { useEffect } from 'react'
import { Controller, UseFormReturn } from 'react-hook-form'
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import {
	useGetFinancingSourcesQuery,
} from '../../api/utilsApi'
import PrimaryButton from '../../components/PrimaryButton'
import FormInput from '@/components/FormInput'


const StepEmployment: React.FC<{
	form: UseFormReturn<RegistrationFormValues>
	onNext: () => void
	onBack: () => void
}> = ({ form, onNext }) => {
	const { control, handleSubmit, setValue, watch } = form
   

	const { data: financingSources, isLoading: loadingFin } =
		useGetFinancingSourcesQuery()


	const financingSourceCode = watch('financingSourceCode')
	const financingSourceDescription = watch('financingSourceDescription')
  


	useEffect(() => {
		const selectedCodes = String(financingSourceCode || '')
			.split(',')
			.map(s => s.trim())
			.filter(Boolean)
			.filter(code => code !== 'OTHER') 

		
		if (selectedCodes.length === 0 && financingSourceDescription && financingSourceDescription.trim()) {
			setValue('financingSourceCode', 'OTHER')
		}
		
	

		
		
	}, [financingSourceCode, financingSourceDescription, setValue])

	const onSubmit = (data: RegistrationFormValues) => {

		onNext()
	}

	if (loadingFin ) {
		return (
			<View
				style={[
					styles.container,
					{ justifyContent: 'center', alignItems: 'center' },
				]}
			>
				<ActivityIndicator color='#fff' size='large' />
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<View>
				<Text style={[styles.title]}>
					Сведения об источниках финансирования
				</Text>

				<Controller
					name='financingSourceCode'
					control={control}
					defaultValue=''
					rules={{
						validate: val => {
							const selectedCodes = String(val || '')
								.split(',')
								.map(s => s.trim())
								.filter(Boolean)
							
							const hasDescription = financingSourceDescription && financingSourceDescription.trim()
							
							return selectedCodes.length > 0 || hasDescription
						},
					}}
					render={({
						field: { value = '', onChange },
						fieldState: { error },
					}) => {
						const selectedSet = new Set(
							String(value)
								.split(',')
								.map(s => s.trim())
								.filter(Boolean)
						)

						const toggle = (code: string) => {
							const next = new Set(selectedSet)
							if (next.has(code)) {
								next.delete(code)
							} else {
								next.add(code)
							
								if (code !== 'OTHER') {
									next.delete('OTHER')
								}
							}
							onChange(Array.from(next).join(','))
						}

						return (
							<View style={styles.checkboxWrapper}>
								{financingSources
									?.filter(({ code }) => String(code).toLowerCase() !== 'other')
									.map((source: ReferenceItem) => {
										const code = String(source.code)
										const isSelected = selectedSet.has(code)
										return (
											<TouchableOpacity
												key={source.id}
												style={styles.checkboxRow}
												onPress={() => toggle(code)}
												activeOpacity={0.8}
											>
												<View style={styles.checkbox}>
													{isSelected && <View style={styles.checked} />}
												</View>
												<Text style={styles.checkboxLabel}>{source.title}</Text>
											</TouchableOpacity>
										)
									})}

								<Controller
									name='financingSourceDescription'
									control={control}
									render={({ field: { value, onChange }, fieldState: { error } }) => {
								

										const handleChange = (text: string) => {
											onChange(text)

										}

										return (
											<FormInput
												placeholder='Иные доходы'
												value={value || ''}
												onChangeText={handleChange}
												error={error?.message}
											
											/>
										)
									}}
								/>

								{error && <Text style={styles.error}>{error.message}</Text>}
							</View>
						)
					}}
				/>

				<Text style={[styles.title, { marginTop: 36 }]}>Род деятельности</Text>
				<Text style={styles.subtitle}>
					Обозначьте свою трудовую деятельность для подтверждения источника
					ваших доходов
				</Text>

				<Controller
					name='employmentType'
					control={control}
					rules={{ required: 'Заполните место работы' }}
					render={({ field: { value, onChange }, fieldState: { error } }) => (
						<FormInput
							placeholder='Место работы'
							value={value ?? ''}
							onChangeText={onChange}
							autoCapitalize='none'
							error={error?.message}
						/>
					)}
				/>

				<Controller
					name='tradingExperience'
					control={control}
					rules={{ required: 'Заполните должность' }}
					render={({ field: { value, onChange }, fieldState: { error } }) => (
						<FormInput
							placeholder='Должность'
							value={value ?? ''}
							onChangeText={onChange}
							autoCapitalize='none'
							error={error?.message}
						/>
					)}
				/>
			</View>
			
			<PrimaryButton title='Продолжить' onPress={handleSubmit(onSubmit)} />
		</View>
	)
}

export default StepEmployment

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 36,
		justifyContent: 'space-between',
	},
	title: {
		fontFamily: 'Montserrat',
		fontSize: 22,
		fontWeight: 'bold',
		color: '#fff',
		marginBottom: 8,
	},
	subtitle: {
		fontFamily: 'Montserrat',
		fontSize: 13,
		color: '#fff',
		marginBottom: 24,
	},
	checkboxRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	checkbox: {
		width: 20,
		height: 20,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: '#fff',
		marginRight: 12,
		justifyContent: 'center',
		alignItems: 'center',
	},
	checked: {
		width: 12,
		height: 12,
		backgroundColor: '#fff',
		borderRadius: 2,
	},
	checkboxLabel: {
		color: '#fff',
		fontSize: 14,
		fontFamily: 'Montserrat',
	},
	checkboxWrapper: {
		marginTop: 12,
	},
	error: {
		color: '#ff7a7a',
		fontSize: 13,
		fontFamily: 'Montserrat',
		marginTop: 4,
		marginLeft: 4,
	},
	disabledInput: {
		opacity: 0.5,
	},
})