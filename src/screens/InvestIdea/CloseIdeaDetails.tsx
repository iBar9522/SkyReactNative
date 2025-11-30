import React from 'react'
import { SafeAreaView, StatusBar, StyleSheet, View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { AppNavigatorkParamList } from '@/navigation/types'
import { InvestIdea } from '@/types/InvestIdeasTypes'
import StockLineChart from './StockLineChart'
import AnalyticalReport from './AnalyticalReport'

type CloseIdeaDetailsRoute = RouteProp<AppNavigatorkParamList, 'CloseIdeaDetails'>

const screenWidth = Dimensions.get('window').width

const calculateFinalResult = (idea: InvestIdea) => {
  const priceOpen = parseFloat(idea.price_open)
  const priceClose = parseFloat(idea.price_close)
  const diff = ((priceClose - priceOpen) / priceOpen) * 100
  const sign = diff >= 0 ? '+' : ''
  return `${sign}${diff.toFixed(1)}%`
}

const CloseIdeaDetails = () => {
  const navigation = useNavigation<any>()
  const route = useRoute<CloseIdeaDetailsRoute>()
  const idea = route.params?.idea

  const dataForChart = {
    ticker: idea.ticker,
    market: 'NASDAQ',
  }
  console.log(idea, 'idea')

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor='#1a2332' />
      <LinearGradient colors={['#091F44', '#3376F6']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
          <View style={styles.stickyHeader}>
            <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name='arrow-back' size={24} color='#FFFFFF' style={{ margin: 16 }} />
            </TouchableOpacity>
            <Text style={styles.company}>{idea.ticker}</Text>
            <View style={{ width: 80 }} />
            </View>
          </View>

          <View style={styles.cardContainer}>
            <View style={styles.header}>
              <View style={styles.companyInfo}>
                <Text style={styles.ticker}>{idea.ticker}</Text>
                <Text style={styles.companyName}>{idea.company}</Text>
              </View>
              <View style={styles.realizedContainer}>
                <Text style={styles.realized}>Реализовано </Text>
              </View>
            </View>
            <View style={styles.finalResultContainer}>
              <Text style={styles.finalResult}>Финальный результат:</Text>
              <Text style={styles.finalResultValue}>{calculateFinalResult(idea)}</Text>
              <Text style={styles.finalResultPeriod}>за 90 дней</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.priceRow}> 
              <View>
                <Text style={styles.priceLabel}>Цена на дату открытия идеи:</Text>
                <Text style={styles.priceDate}>({new Date(idea.date_opened).toLocaleDateString('ru-RU')})</Text>
              </View>
              <Text style={styles.priceValue}>{parseFloat(idea.price_open).toFixed(2)} USD</Text>
            </View>

            <View style={styles.priceRow}> 
              <View>
                <Text style={styles.priceLabel}>Цена на дату закрытия идеи:</Text>
                {idea.date_closed && (
                  <Text style={styles.priceDate}>({new Date(idea.date_closed).toLocaleDateString('ru-RU')})</Text>
                )}
              </View>
              <Text style={styles.priceValue}>{parseFloat(idea.price_close).toFixed(2)} USD</Text>
            </View>
          </View>

          <StockLineChart data={dataForChart} />

          <View style={styles.currentWrapper}>
            <Text style={styles.currentText}>Сейчас:</Text>
            <View style={styles.currentPriceContainer}>
              <Text style={styles.currentPriceText}>{parseFloat(idea?.marketData?.currentPrice || '0').toFixed(0)} USD</Text>
            </View>
          </View>
                      <Text style={styles.descriptionTitle}>Отчет о закрытии:</Text>
          <View style={styles.descriptionContainer}>

            <Text style={styles.descriptionText}>{idea?.description || 'Нет описания'}</Text>
          </View>
          <AnalyticalReport title="Инвестиционный тезис" content={idea?.thesis || ''} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

export default CloseIdeaDetails

const styles = StyleSheet.create({
  container: { flex: 1, fontFamily: 'Montserrat' },
  scrollView: { flex: 1 },
  stickyHeader: { backgroundColor: 'transparent' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 60,
    justifyContent: 'space-between',
  },
  company: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', fontFamily: 'Montserrat', marginLeft: 16 },
  cardContainer: {

    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    fontFamily: 'Montserrat',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 0 },
  companyInfo: { flex: 1 },
  ticker: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', fontFamily: 'Montserrat', marginBottom: 4 },
  companyName: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 16, fontFamily: 'Montserrat' },
  returnContainer: { alignItems: 'flex-end' },
  returnPercentage: { color: '#06D6A0', fontSize: 20, fontWeight: '700', fontFamily: 'Montserrat' },
  returnLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, fontFamily: 'Montserrat', marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)', marginVertical: 16 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  priceLabel: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Montserrat' },
  priceDate: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'Montserrat' },
  priceValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', fontFamily: 'Montserrat' },
  currentWrapper: { justifyContent: 'center', alignItems: 'center' },
  currentText: { color: '#FAFAFA', fontSize: 12, fontFamily: 'Montserrat' },
  currentPriceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    width: screenWidth - 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    padding: 16,
  },
  currentPriceText: { color: '#FFFFFF', fontSize: 20 },
  reportContainer: { paddingHorizontal: 16, paddingBottom: 24 },
  reportTitle: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Montserrat', marginBottom: 8 },
  reportText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontFamily: 'Montserrat', lineHeight: 20 },
  realizedContainer :{ backgroundColor:'#06D6A0', borderRadius: 10, padding: 10 },
  realized : { color:'#FAFAFA', fontSize: 10, fontFamily: 'Montserrat', fontWeight: '700' },
  finalResultContainer : {alignItems:'center', marginTop:16, gap: 6},
  finalResult : { color:'#FAFAFA', fontSize: 14, fontFamily: 'Montserrat', fontWeight: '500' },
  finalResultValue : { color:'#06D6A0', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '600' },
  finalResultPeriod : { color:'#FAFAFA', fontSize: 14, fontFamily: 'Montserrat', fontWeight: '500' },
  descriptionContainer : { marginTop:25, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: 20, marginHorizontal: 16, marginBottom: 16, fontFamily: 'Montserrat' },
  descriptionText : { color: '#FAFAFA', fontSize: 14, fontFamily: 'Montserrat', lineHeight: 20 },
  descriptionTitle : { color: '#FFFFFF', fontSize: 16, fontFamily: 'Montserrat', fontWeight: '600', marginLeft:18, marginTop:25 },
})


