import { RegistrationFormValues } from '@/types/AuthTypes'
import { useForm, UseFormReturn } from 'react-hook-form'

export const useRegistrationForm =
	(): UseFormReturn<RegistrationFormValues> => {
		return useForm<RegistrationFormValues>({
			defaultValues: {
				// email:'',
				// firstName: '',
				// lastName: '',
				phone: '',
				password: '',
				// code: '',
				pin: '',
				// isFatca: false,
				// isResident: true,
				// isPep: false,
				// financingSourceDescription: '',
				// tradingExperienceCode: '',
				// employmentType: '',
				// bankName:'',
				// accountNumber:'',
				// bankBic:'',
				// financingSourceCode:''
			},
			mode: 'onChange',
		})
	}
