import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, Keyboard, KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Button from '@/components/Button';
import Icon from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native';

const StepAskSupport = () => {
  const navigation = useNavigation<any>()
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={{ flex: 1 }}>
      <LinearGradient
        colors={['rgb(51, 118, 246)', 'rgb(9, 32, 68)', 'rgb(0, 0, 0)']}
        style={styles.container}

      >
        <View style={styles.arrow_back} onTouchEnd={() => navigation.goBack()}>
          <Icon name='arrow-back' size={24} color='rgb(255, 255, 255)' />
          </View>
        <View style={styles.logoContainer}>
       
        <Image
          source={require('@/assets/logo_sbi.png')}
          style={styles.logo}
          resizeMode='contain'
        />
        <Text style={styles.text}>
          Пожалуйста свяжитесь с нашими операторами для дальнейших инструкций
        </Text>
         <View style={styles.buttonContainer}>
          <Button title='Поддержка' textSize={16} style={styles.buttonSupport} textStyle={styles.buttonTextSupport}  onPress={() => {}}/>
            <TouchableOpacity style={styles.returnSoon} onPress={() => navigation.navigate('Tabs' as never)}>
              <Text style={styles.returnSoonText}>Главный экран</Text>
            </TouchableOpacity>

          </View> 
        </View>   
       
      </LinearGradient>
     
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
   
    height: '100%',
  },
  logoContainer : {
   alignItems: 'center',


   gap:80,
  },
  buttonContainer : {
    gap: 15,
  },
  buttonSupport : {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    width: 350,
    
    marginTop: 145,
 
   
  },
  buttonTextSupport: {
   
    textAlign: 'center',
    color: '#FFFFFF',
  },

  logo: {
    marginTop: 10,
    width: 350, 
    height: 250, 
  },
  text : {
    fontSize: 20,
    fontWeight: '700',
    color: "#FFFFFF",
    textAlign: 'center',
  },
  arrow_back : {
    marginTop: 70,
    marginLeft: 20,
    cursor:'pointer'
  },
  returnSoon : {
   marginTop: 10
  },
  returnSoonText : {
    fontSize: 14,
    color: "#FFFFFF",
    textDecorationLine: 'underline',
    textAlign: 'center',
  }
 
});

export default StepAskSupport;