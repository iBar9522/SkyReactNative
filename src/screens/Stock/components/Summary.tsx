import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = { commission: number; total: string };

export const Summary: React.FC<Props> = ({ commission, total }) => (
  <>
    <Text style={styles.commission}>Комиссия: {commission} USD</Text>
    <View style={styles.totalContainer}>
      <Text style={styles.totalLabel}>Сумма:</Text>
      <Text style={styles.totalAmount}>{total}</Text>
    </View>
  </>
);

const styles = StyleSheet.create({
  commission: { color: "rgba(255,255,255,0.8)", fontSize: 14, textAlign: "center", marginBottom: 16 },
  totalContainer: { alignItems: "center", marginBottom: 24 },
  totalLabel: { color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 8 },
  totalAmount: { color: "#fff", fontSize: 24, fontWeight: "600" },
});
