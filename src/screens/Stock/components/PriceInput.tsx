import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import FormInput from "@/components/FormInput";

type Props = { value: string; onChange: (val: string) => void; increase: () => void; decrease: () => void };

export const PriceInput: React.FC<Props> = ({ value, onChange, increase, decrease }) => (
  <View style={styles.inputContainer}>
    <TouchableOpacity style={styles.roundButtonMinus} onPress={decrease}>
      <Image source={require('@/assets/minus-icon.png')} style={styles.icon} />
    </TouchableOpacity>
    <FormInput style={styles.input} value={value} onChangeText={onChange} keyboardType="decimal-pad" textAlign="center" />
    <TouchableOpacity style={styles.roundButtonPlus} onPress={increase}>
      <Image source={require('@/assets/plus-icon.png')} style={styles.icon} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  inputContainer: { flex: 1, width: "100%", position: "relative", marginBottom: 20 },
  roundButtonMinus: { position: "absolute", left: 5, top: "25%" },
  roundButtonPlus: { position: "absolute", right: 5, top: "25%" },
  input: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, paddingVertical: 12, color: "#fff", fontSize: 18 },
  icon: { width: 24, height: 24 },
});
