import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { BarChart } from 'react-native-chart-kit'
import { InvestIdea } from '@/types/InvestIdeasTypes'

const chartConfig = {
  backgroundGradientFrom: "transparent",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "transparent",
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.7,
  useShadowColorFromDataset: false,
  propsForBackgroundLines: {
    strokeDasharray: '5,5',
    stroke: 'rgba(255, 255, 255, 0.15)',
    strokeWidth: 1
  },
  propsForLabels: {
    fontSize: 12,
    fontFamily: 'Montserrat',
    fontWeight: '400',
    fill: '#FFFFFF'
  },
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  decimalPlaces: 0
};

interface CloseIdeasProps {
  data: Array<{
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }>;
  closedIdeas: InvestIdea[];
}

const calculateFinalResult = (idea: InvestIdea) => {
  const priceOpen = parseFloat(idea.price_open)
  const priceClose = parseFloat(idea.price_close)
  return (Math.abs(priceClose - priceOpen) / priceOpen * 100).toFixed(1)
}

const getReturnColor = (idea: InvestIdea) => {
  const priceOpen = parseFloat(idea.price_open)
  const priceClose = parseFloat(idea.price_close)
  return priceClose > priceOpen ? '#00D084' : '#FF6B6B'
}

const getReturnSign = (idea: InvestIdea) => {
  const priceOpen = parseFloat(idea.price_open)
  const priceClose = parseFloat(idea.price_close)
  return priceClose > priceOpen ? '+' : '-'
}

const getStatusColor = (idea: InvestIdea) => {
  const priceOpen = parseFloat(idea.price_open)
  const priceClose = parseFloat(idea.price_close)
  return priceClose > priceOpen ? '#00D084' : '#FF6B6B'
}

const screenWidth = Dimensions.get('window').width  

const CloseIdeas = ({ data, closedIdeas }: CloseIdeasProps) => {
  const navigation = useNavigation<any>()
 
  const chartData = {
    labels: data.map(item => item.name.split(' ')[0]),
    datasets: [
      {
        data: data.map(item => item.population),
        colors: data.map(item => 
          item.name.includes('Успешно') 
            ? (opacity = 1) => '#00D084'  // Зеленый для успешных
            : (opacity = 1) => '#FF6B6B'  // Красный для неуспешных
        )
      }
    ]
  };
  console.log('closedIdeas', closedIdeas)
 
	return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
    
      <View style={styles.chartSection}>
        <View style={styles.chartContainer}>
          <BarChart
            data={chartData}
            width={screenWidth - 36}
            height={300}
            chartConfig={{
              ...chartConfig,
              barPercentage: 2,
              fillShadowGradientOpacity: 1,
            }}
            yAxisLabel=""
            yAxisSuffix="%"
            fromZero
            showValuesOnTopOfBars
            withInnerLines
            segments={5}
            withCustomBarColorFromData
            flatColor
            style={{
              borderRadius: 16,
            }}
          />
        </View>

      
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#00D084' }]} />
            <Text style={styles.legendText}>Успешно реализованные</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.legendText}>Неуспешно реализованные</Text>
          </View>
        </View>
      </View>

   
      <View style={styles.cardsContainer}>
        {closedIdeas?.map((idea) => (
          <View key={idea.id} style={styles.investmentCard}>
            <View style={styles.cardHeader}>
              <View style={styles.companyInfo}>
              
                <View style={styles.companyDetails}>
                  <Text style={styles.companyTicker}>{idea.ticker}</Text>
                  <Text style={styles.companyName}>{idea.company}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(idea) }]}>
                <Text style={styles.statusText}>Реализовано</Text>
              </View>
            </View>

            <View style={styles.resultSection}>
              <Text style={styles.resultLabel}>Финальный результат:</Text>
              <Text style={[styles.resultPercentage, { color: getReturnColor(idea) }]}>
                {getReturnSign(idea)}{calculateFinalResult(idea)}%
              </Text>
              <Text style={styles.periodText}>за 90 дней</Text>
            </View>

            <TouchableOpacity style={styles.detailButton} onPress={() => navigation.navigate('CloseIdeaDetails', { idea })}>
              <Text style={styles.detailButtonText}>Подробнее о закрытии</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
	)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chartSection: {
    paddingHorizontal: 16,
    
    paddingBottom: 20,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  greenSegmentLabel: {
    position: 'absolute',
  },
  redSegmentLabel: {
    position: 'absolute',
  },
  percentageText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Montserrat',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Montserrat',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  investmentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    fontFamily: 'Montserrat',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyLogo: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  companyDetails: {
    flex: 1,
  },
  companyTicker: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    marginBottom: 2,
  },
  companyName: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontFamily: 'Montserrat',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Montserrat',
  },
  resultSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontFamily: 'Montserrat',
    marginBottom: 8,
  },
  resultPercentage: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    marginBottom: 4,
  },
  periodText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontFamily: 'Montserrat',
  },
  detailButton: {
    borderWidth: 1,
    borderColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat',
  },
})

export default CloseIdeas