import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';


const metrics = [
  { key: 'revenue', labelRu: 'Выручка' },
  { key: 'ebitda', labelRu: 'EBITDA' },
  { key: 'ebitda_margin', labelRu: 'EBITDA Маржа', isPercentage: true },
  { key: 'net_income', labelRu: 'Чистая прибыль' },
  { key: 'net_income_margin', labelRu: 'Маржа чистой прибыли', isPercentage: true },
  { key: 'free_cash_flow', labelRu: 'Свободный денежный поток' },
  { key: 'total_assets', labelRu: 'Общие активы' },
  { key: 'total_debt', labelRu: 'Общий долг' },
  { key: 'total_equity', labelRu: 'Общий капитал' },
];

const FinancialIndicatorsTable = ({data, isLoading, error}) => {
    console.log(data, '->')
    const years = useMemo(
    () => data?.data.map((item: any) => String(item.year)),
    [data]
  );

  
  const rows = useMemo(() => {
    return metrics.map(m => {
      const values: Record<string, any> = {};
      data?.data.forEach((item: any) => {
        values[item.year] = item[m.key];
      });
      return { ...m, values };
    });
  }, [data]);
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Загрузка финансовых данных...</Text>
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




  const formatValue = (value: any, isPercentage = false) => {
    if (value === undefined || value === null) return '-';
    if (isPercentage) return `${(value * 100).toFixed(1)}%`;
    return value.toString();
  };
  console.log(years, '->')
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.tableContainer}>
        <Text style={styles.title}>Финансовые показатели</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          <View>
            
            <View style={styles.headerRow}>
              <View style={styles.headerLabelCell}>
                <Text style={styles.headerLabelText}>Показатель</Text>
              </View>
              {years.map(year => (
                <View key={year} style={styles.headerYearCell}>
                  <Text style={styles.headerYearText}>{year}</Text>
                </View>
              ))}
            </View>

          
            {rows.map((row, index) => (
              <View
                key={row.key}
                style={[
                  styles.dataRow,
                  index % 2 === 0 ? styles.evenRow : styles.oddRow,
                ]}
              >
                <View style={styles.labelCell}>
                  <Text style={styles.labelText}>{row.labelRu}</Text>
                </View>
                {years.map((year, index) => (
                  <View key={index} style={styles.valueCell}>
                    <Text style={styles.valueText} numberOfLines={1}>
                      {formatValue(row.values[year], row.isPercentage)}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#64748b' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#ef4444' },
  tableContainer: {

    borderRadius: 16,
    overflow: 'hidden',
   
  },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', padding: 16 },
  headerRow: { flexDirection: 'row', backgroundColor: '#FAFAFA', borderRadius: 8 },
  headerLabelCell: { width: 180, paddingVertical: 14, paddingHorizontal: 12 },
  headerLabelText: { color: 'black', fontSize: 14, fontWeight: '600' },
  headerYearCell: { width: 110, paddingVertical: 14, paddingHorizontal: 12, alignItems: 'center' },
  headerYearText: { color: 'black', fontSize: 16, fontWeight: '600' },
  dataRow: { flexDirection: 'row' },
  evenRow: { backgroundColor: 'rgba(255,255,255,0.05)' },
  oddRow: { backgroundColor: 'transparent' },
  labelCell: { width: 180, paddingVertical: 14, paddingHorizontal: 12 },
  labelText: { color: 'white', fontSize: 14, fontWeight: '500' },
  valueCell: { width: 110, paddingVertical: 14, paddingHorizontal: 12, alignItems: 'center' },
  valueText: { color: 'white', fontSize: 14, fontWeight: '600' },
});

export default FinancialIndicatorsTable;
