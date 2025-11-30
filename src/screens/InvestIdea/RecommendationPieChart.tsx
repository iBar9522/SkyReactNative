import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

interface RecommendationData {
  recommendation_count_buy?: number;
  recommendation_count_hold?: number;
  recommendation_count_sell?: number;
}

interface Props {
  data: RecommendationData;
}
 

const RecommendationsPieChart = ({ data }: Props) => {

  const buyCount = data?.recommendation_count_buy || 15;
  const holdCount = data?.recommendation_count_hold || 8;
  const sellCount = data?.recommendation_count_sell || 2;
  
  const total = buyCount + holdCount + sellCount;
  const pieData = [
    {
      value: buyCount,
      color: '#1F94FF',
      gradientCenterColor: '#4FC3F7',
      focused: buyCount === Math.max(buyCount, holdCount, sellCount),
      text: `${Math.round((buyCount / total) * 100)}%`,
      label: 'Покупать',
    },
    {
      value: holdCount,
      color: '#06D6A0',
      gradientCenterColor: '#66BB6A',
      focused: holdCount === Math.max(buyCount, holdCount, sellCount),
      text: `${Math.round((holdCount / total) * 100)}%`,
      label: 'Держать',
    },
    {
      value: sellCount,
      color: '#FF6B60',
      gradientCenterColor: '#FF8A65',
      focused: sellCount === Math.max(buyCount, holdCount, sellCount),
      text: `${Math.round((sellCount / total) * 100)}%`,
      label: 'Продавать',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Рекомендации международных брокеров</Text>
      
      <View style={styles.chartContainer}>
        <PieChart
          data={pieData}
          radius={120}
          innerRadius={0}
          
          
          showGradient={true}
          semiCircle={false}
          focusOnPress={false}
          toggleFocusOnPress={false}
          showText={true}
          textColor="#FFFFFF"
          textSize={16}
          fontWeight="700"
          textBackgroundRadius={4}
          strokeWidth={0}
          initialAngle={0}
          centerLabelComponent={() => null}
        />
      </View>

     
      <View style={styles.legendContainer}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#00A3FF' }]} />
            <Text style={styles.legendText}>Покупать</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#00E676' }]} />
            <Text style={styles.legendText}>Держать</Text>
          </View>
          {sellCount > 0 && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF5722' }]} />
              <Text style={styles.legendText}>Продавать</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    margin: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    marginBottom: 20,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    height: 220,
  },
  legendContainer: {
    marginBottom: 20,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontFamily: 'Montserrat',
  },
  consensusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  consensusLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat',
  },
  consensusValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat',
  },
});

export default RecommendationsPieChart;