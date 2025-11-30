import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

type Props = { value: number; onChange: (val: number) => void };

export const ProgressSlider: React.FC<Props> = ({ value, onChange }) => (
  <View style={styles.container}>
    <Text style={styles.label}>Процент от суммы</Text>
    <Slider style={styles.slider} minimumValue={0} maximumValue={100} step={1} value={value} onValueChange={(v) => onChange(Math.round(v))} />
    <View style={styles.progressLabels}>
      <Text style={styles.progressLabel}>0%</Text>
      <Text style={styles.progressLabelCenter}>{value}%</Text>
      <Text style={styles.progressLabel}>100%</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { color: "rgba(250,250,250,0.8)", fontSize: 14, marginBottom: 8 },
  slider: { width: "100%", height: 40 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { color: "#fff", fontSize: 12 },
  progressLabelCenter: { color: "#06d6a0", fontSize: 14, fontWeight: "600" },
});
