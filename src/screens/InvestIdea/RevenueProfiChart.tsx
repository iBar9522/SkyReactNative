import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const screenWidth = Dimensions.get('window').width

type ChartItem = { year: string | number; revenue: number; net_income: number }
type ApiData = { data: ChartItem[] }
type BarPoint = { value: number; frontColor?: string; topLabelComponent?: () => React.ReactElement }
type LinePoint = {
  value: number
  dataPointText?: string
  dataPointColor?: string
  dataPointRadius?: number
  dataPointLabelComponent?: () => React.ReactElement
}

type RevenueProfitChartProps = {
  data?: ApiData | null
  isLoading?: boolean
  error?: unknown
}

const RevenueProfitChart = ({ data, isLoading, error }: RevenueProfitChartProps) => {
  
  const { barData, lineData } = useMemo((): { barData: BarPoint[]; lineData: LinePoint[] } => {
    if (!data?.data) return { barData: [], lineData: [] };
    
    const barResult: BarPoint[] = [];
    const lineResult: LinePoint[] = [];
    
    data.data.forEach((item: ChartItem, index: number) => {
      const isLast = index === data.data.length - 1;
    
      barResult.push({
        value: item.revenue * 1.5,
       frontColor: 'rgba(6, 214, 160, 0.8)',
        topLabelComponent: () => (
          <View style={{ marginRight: isLast ? -5 : 0 }}> 
            <Text style={styles.barTopLabel}>{item.revenue}</Text>
          </View>
        ),
      });
    
      if (item.net_income !== item.revenue) {
      
        const prevValue = index > 0 ? data.data[index - 1].net_income : item.net_income;
        const isLineGoingUp = item.net_income >= prevValue;
        
        lineResult.push({
          value: item.net_income,
          dataPointText: item.net_income.toString(),
          dataPointColor: '#FFFFFF',
          dataPointRadius: 6,
          dataPointLabelComponent: () => (
            <Text style={[styles.lineLabel, isLineGoingUp ? styles.lineLabelTop : styles.lineLabelBottom]}>
              {item.net_income}
            </Text>
          ),
        });
      } else {
        // Добавляем точку без label
        lineResult.push({
          value: item.net_income,
          dataPointColor: '#FFFFFF',
          dataPointRadius: 6,
        });
      }
    });
    
    return { barData: barResult, lineData: lineResult };
  }, [data]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Загрузка данных графика...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ошибка загрузки данных</Text>
      </View>
    );
  }

  if (!data || !data.data?.length) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Данные не найдены</Text>
      </View>
    );
  }

  const maxValue = Math.max(
    ...data.data.map((item: ChartItem) => Math.max(item.revenue, item.net_income))
  )

  const BAR_WIDTH = 28
  const BAR_SPACING = 18
  const horizontalPadding = 32
  const estimatedWidth = data?.data?.length
    ? data.data.length * (BAR_WIDTH + BAR_SPACING) + horizontalPadding
    : screenWidth - 32
  const chartWidth = Math.max(screenWidth - 32, estimatedWidth)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Динамика выручки и прибыли</Text>
      
      <View style={[styles.chartContainer]}>
        <ScrollView    showsHorizontalScrollIndicator
    contentContainerStyle={{ paddingRight: 60 }}  >
          <BarChart
            data={barData}
            lineData={lineData}
            showLine
            lineConfig={{
              color: '#FAFAFA',
              thickness: 1.5,
              curved: false,
              textShiftY: 20,
              textShiftX: -6,
              
              hideDataPoints: false,
              dataPointsColor: '#FFFFFF',
              dataPointsRadius: 4,
              shiftY: 30,
         
              
              isAnimated: true,
              textColor: '#FFFFFF',
              animationDuration: 800,
              strokeDashArray: [5, 5],
            }}
            width={chartWidth}
            endSpacing={50}
            height={320}
            barWidth={BAR_WIDTH}
            spacing={BAR_SPACING}
            initialSpacing={16}
            
            hideRules={false}
            rulesColor="rgba(255, 255, 255, 0.15)"
            rulesThickness={1}
            xAxisThickness={1}
            
            yAxisThickness={1}
            xAxisColor="rgba(255, 255, 255, 0.2)"
            yAxisColor="rgba(255, 255, 255, 0.2)"
            yAxisTextStyle={styles.yAxisLabel}
            noOfSections={5}
       
            maxValue={(maxValue + 120) * 1.5}
            yAxisLabelWidth={48}
            showYAxisIndices
            yAxisIndicesColor="rgba(255, 255, 255, 0.3)"
            yAxisIndicesWidth={8}
          />
        </ScrollView>
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendCircle, { backgroundColor: '#FFFFFF' }]} />
          <Text style={styles.legendText}>Чистая прибыль</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSquare, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Общий доход</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily: 'Montserrat',
    borderRadius: 16,
    padding:22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    overflow: 'visible'
  },
  barTopLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    
   
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  lineLabel: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lineLabelTop: {
    marginTop: -40,
  },
  lineLabelBottom: {
    marginTop: 15,
  },
  yAxisLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30,
  },
  legendCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  legendText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default RevenueProfitChart;