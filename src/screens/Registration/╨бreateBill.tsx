
import PrimaryButton from '@/components/PrimaryButton'
import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { Image, StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

const СreateBill = () => {
  const navigation = useNavigation<any>()
  return (
    <View style={styles.container}>
       <KeyboardAvoidingView style={{ flex: 1 }}>
      	<LinearGradient style={styles.container}    colors={['rgb(51, 118, 246)', 'rgb(9, 32, 68)', 'rgb(0, 0, 0)']}>

       
      <View style={styles.logoContainer}>
      	<Image
							source={require('@/assets/logo_sbi.png')}
							style={styles.logo}
							resizeMode='contain'
						/>
         </View>   
         <View style={styles.textContainer}>
          <View>
          <Text style={styles.firstText}>Давайте откроем Вам счет</Text>
          <Text style={styles.secondText}>Вы можете открыть счет сейчас, либо ознакомиться с приложением и вернуться к этому этапу позже</Text>
          </View>
          <View style={styles.buttonContainer}>
         <PrimaryButton style={styles.button} title='Открыть счет' onPress={() => {navigation.navigate('Billing')}} />
          <TouchableOpacity onPress={() => navigation.navigate("Tabs")}>
          <Text style={styles.backButton}>Вернуться позже</Text>
          </TouchableOpacity>
          </View>
          </View>
          </LinearGradient> 
          
       
          </KeyboardAvoidingView>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily: 'Montserrat',
  
  },
  firstText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  secondText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    marginTop: 10,
    textAlign: 'center',
  },
  backButton: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 10,
  },
  logo: { width: 350, height: 250,},
  logoContainer: {
    marginTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 0.8,
    marginTop: 40,
    justifyContent: 'space-between',
    
   
  },
  button: {
    width: '100%',
    maxWidth: 350,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    
   
  },
 
})
export default СreateBill