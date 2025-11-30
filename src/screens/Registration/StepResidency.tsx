import React, { useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	LayoutAnimation,
	UIManager,
	Platform,
} from 'react-native'
import { UseFormReturn, Controller } from 'react-hook-form'
import PrimaryButton from '../../components/PrimaryButton'
import type { RegistrationFormValues } from '../../types/AuthTypes'
import { useNavigation } from '@react-navigation/native'

if (Platform.OS === 'android') {
	UIManager.setLayoutAnimationEnabledExperimental?.(true)
}

type Props = {
	form: UseFormReturn<RegistrationFormValues>
	onNext: () => void
	onBack: () => void
}

const Divider = () => <View style={styles.divider} />
const RadioRow = ({
	label,
	selected,
	onPress,
}: {
	label: string
	selected: boolean
	onPress: () => void
}) => (
	<Pressable style={styles.radioRow} onPress={onPress}>
		<View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
			{selected ? <View style={styles.radioInner} /> : null}
		</View>
		<Text style={styles.radioText}>{label}</Text>
	</Pressable>
)

const StepResidency: React.FC<Props> = ({ form, onNext }) => {
	const { control, setValue, handleSubmit, watch } = form

	const isResident = watch('isResident')
	const isFatca = watch('isFatca')

	const [fatcaOpen, setFatcaOpen] = useState(false)
	const [pdlOpen, setPdlOpen] = useState(false)
  const navigation = useNavigation<any>()
	const toggle = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
		setter((prev: boolean) => !prev)
	}

	const submit = () => { 
		if (isResident && !isFatca) {
			onNext()
		} else {
      navigation.navigate('StepAskSupport')
		}
	} 

	return (
		<View style={styles.container}>
	
			<View style={styles.block}>
				<Text style={styles.title}>Являетесь ли Вы резидентом Казахстана?</Text>
				<Text style={styles.subtitle}>
					Указание резидентства необходимо для корректной обработки ваших данных
					и выбора соответствующей процедуры проверки.
				</Text>

				<Controller
					name='isResident'
					control={control}
					render={() => (
						<>
							<RadioRow
								label='Да'
								selected={isResident === true}
								onPress={() =>
									setValue('isResident', true, { shouldValidate: true })
								}
							/>
							<Divider />
							<RadioRow
								label='Нет'
								selected={isResident === false}
								onPress={() =>
									setValue('isResident', false, { shouldValidate: true })
								}
							/>
						</>
					)}
				/>
			</View>
			<View style={styles.block}>
				<Text style={[styles.title, { marginBottom: 12 }]}>
					Являетесь ли вы субъектом FATCA или ПДЛ?
				</Text>

				<Controller
					name='isFatca'
					control={control}
					render={() => (
						<>
							<RadioRow
								label='Да'
								selected={isFatca === true}
								onPress={() =>
									setValue('isFatca', true, { shouldValidate: true })
								}
							/>
							<Divider />
							<RadioRow
								label='Нет'
								selected={isFatca === false}
								onPress={() =>
									setValue('isFatca', false, { shouldValidate: true })
								}
							/>
						</>
					)}
				/>

				<Pressable
					style={styles.accHeader}
					onPress={() => toggle(setFatcaOpen)}
				>
					<Text style={styles.accTitle}>Кто такой субъект FATCA?</Text>
					<Text style={styles.accCaret}>{fatcaOpen ? '▴' : '▾'}</Text>
				</Pressable>
				{fatcaOpen && (
					<Text style={styles.accBody}>
						Субъект FATCA — физическое или юридическое лицо, на которое
						распространяются требования американского закона FATCA (Foreign
						Account Tax Compliance Act) о раскрытии информации для целей
						налогообложения США.
					</Text>
				)}

				<Pressable style={styles.accHeader} onPress={() => toggle(setPdlOpen)}>
					<Text style={styles.accTitle}>Кто такой ПДЛ?</Text>
					<Text style={styles.accCaret}>{pdlOpen ? '▴' : '▾'}</Text>
				</Pressable>
				{pdlOpen && (
					<Text style={styles.accBody}>
						ПДЛ — публичное должностное лицо: человек, занимающий либо
						занимавший значимую государственную должность, а также его близкие
						родственники и аффилированные лица. Для ПДЛ действуют усиленные
						процедуры проверки.
					</Text>
				)}
			</View>

			<PrimaryButton title='Продолжить' onPress={handleSubmit(submit)} />
		</View>
	)
}

export default StepResidency

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 24,
		justifyContent: 'space-between',
	},
	block: {
		marginBottom: 14,
	},
	title: {
		fontFamily: 'Montserrat',
		fontSize: 20,
		fontWeight: '700',
		color: '#fff',
		marginBottom: 8,
	},
	subtitle: {
		fontFamily: 'Montserrat',
		fontSize: 13,
		lineHeight: 18,
		color: 'rgba(255,255,255,0.85)',
		marginBottom: 14,
	},
	radioRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
	},
	radioOuter: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: 'rgba(255,255,255,0.55)',
		marginRight: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	radioOuterActive: {
		borderColor: '#fff',
	},
	radioInner: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: '#fff',
	},
	radioText: {
		color: '#fff',
		fontSize: 16,
		fontFamily: 'Montserrat',
	},
	divider: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: 'rgba(255,255,255,0.15)',
	},
	accHeader: {
		marginTop: 12,
		paddingVertical: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	accTitle: {
		color: 'rgba(200,210,225,1)',
		textDecorationLine: 'underline',
		fontFamily: 'Montserrat',
		fontSize: 13,
	},
	accCaret: {
		color: 'rgba(200,210,225,1)',
		fontSize: 16,
		marginLeft: 8,
	},
	accBody: {
		color: 'rgba(225,230,240,0.9)',
		fontSize: 13,
		lineHeight: 18,
		marginTop: 4,
	},
})
