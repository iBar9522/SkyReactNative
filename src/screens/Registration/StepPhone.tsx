import PhoneInputWithCountry from '@/components/PhoneInputWithCountry'
import { useNavigation } from '@react-navigation/native'
import React, { useState, useEffect, useRef } from 'react'
import { Controller, UseFormReturn } from 'react-hook-form'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import FormInput from '../../components/FormInput'
import PrimaryButton from '../../components/PrimaryButton'
import { RegistrationFormValues } from '@/types/AuthTypes'
import { useSendSmsCodeMutation } from '@/api/notificationsApi'
import Toast from 'react-native-toast-message'

type Props = {
  form: UseFormReturn<RegistrationFormValues>
  onNext: () => void
  onError?: () => void
}

const StepPhone: React.FC<Props> = ({ form, onNext, onError }) => {
  const { control, handleSubmit } = form
  const navigation = useNavigation<any>()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [sendSmsCode] = useSendSmsCodeMutation()

  const hasNavigatedRef = useRef(false)
  const [cooldown, setCooldown] = useState(0)
  const [isSending, setIsSending] = useState(false)


  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(prev => prev - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  const onSubmit = async (data: RegistrationFormValues) => {
    if (cooldown > 0 || isSending || hasNavigatedRef.current) return

    setIsSending(true)
    setCooldown(7)

    try {
      await sendSmsCode({ phone: data.phone }).unwrap()
      Toast.show({ type: 'success', text1: 'Код отправлен' })
      
      // Показываем текст на ~1 секунду, затем переходим далее
      setTimeout(() => {
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true
          onNext()
        }
      }, 2000)
    } catch (err) {
      console.warn(err)
      setCooldown(0)
      Toast.show({ type: 'error', text1: 'Ошибка отправки кода' })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Начните прямо сейчас</Text>
        <Text style={styles.subtitle}>
          Укажите свои данные и создайте надёжный пароль
        </Text>
      </View>

      <View>
        <PhoneInputWithCountry name='phone' control={control} />

        <Controller
          name='password'
          control={control}
          rules={{
            required: 'Введите пароль',
            minLength: {
              value: 8,
              message: 'Минимум 8 символов',
            },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
              message:
                'Пароль должен содержать заглавную, строчную букву, цифру и спецсимвол',
            },
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <View style={styles.inputWrapper}>
                <FormInput
                  placeholder='Пароль'
                  placeholderTextColor='#aaa'
                  secureTextEntry={!showPassword}
                  value={value}
                  keyboardType='default'
                  textContentType='username'
                  autoComplete='off'
                  passwordRules=''
                  autoCorrect={false}
                  spellCheck={false}
                  autoCapitalize='none'
                  clearTextOnFocus={false}
                  onChangeText={onChange}
                  error={error?.message}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(prev => !prev)}
                  style={styles.eyeButton}
                >
                  <Image
                    source={
                      showPassword
                        ? require('../../assets/eye.png')
                        : require('../../assets/eye-slash.png')
                    }
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        />

        <Controller
          name='confirmPassword'
          control={control}
          rules={{
            required: 'Повторите пароль',
            validate: value =>
              value === form.getValues('password') || 'Пароли не совпадают',
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <View style={styles.inputWrapper}>
                <FormInput
                  placeholder='Повторите пароль'
                  placeholderTextColor='#aaa'
                  textContentType='username'
                  autoComplete='off'
                  passwordRules=''
                  autoCorrect={false}
                  spellCheck={false}
                  autoCapitalize='none'
                  clearTextOnFocus={false}
                  secureTextEntry={!showConfirmPassword}
                  value={value}
                  onChangeText={onChange}
                  error={error?.message}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(prev => !prev)}
                  style={styles.eyeButton}
                >
                  <Image
                    source={
                      showConfirmPassword
                        ? require('../../assets/eye.png')
                        : require('../../assets/eye-slash.png')
                    }
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        />
      </View>

      <View style={{ marginBottom: 40 }}>
        {cooldown > 0 ? (
          <Text style={styles.cooldownText}>
            Можно повторить через {cooldown} c
          </Text>
        ) : (
          <PrimaryButton
            title={'Продолжить'}
            onPress={handleSubmit(onSubmit)}
            disabled={isSending}
          />
        )}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Уже есть аккаунт?</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default StepPhone

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 36,
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    marginBottom: 8,
    fontFamily: 'Montserrat',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 27,
    letterSpacing: 0,
    textAlign: 'left',
  },
  subtitle: {
    color: '#fff',
    fontFamily: 'Montserrat',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: 0,
    marginBottom: 24,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    top: 20,
    transform: [{ translateY: -11 }],
    padding: 4,
    zIndex: 1,
  },
  eyeIcon: {
    width: 22,
    height: 22,
    tintColor: '#fff',
  },
  error: {
    color: '#ff7a7a',
    fontSize: 13,
    fontFamily: 'Montserrat',
  },
  linkText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Montserrat',
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginTop: 12,
  },
  cooldownText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat',
    textAlign: 'center',
    paddingVertical: 16,
    opacity: 0.9,
  },
})