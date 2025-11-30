import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import FormInput from "@/components/FormInput";

type Props = {
  value: string;
  onChange: (val: string) => void;
  increase: () => void;
  decrease: () => void;
};

export const QuantityInput: React.FC<Props> = ({ value, onChange, increase, decrease }) => (
  <View style={styles.formGroup}>
    <View style={styles.toggleContainer}>
      <Text style={styles.toggleText}>Количество</Text>
      <View style={styles.toggleSwitch}>
        <Image source={require('@/assets/swap-icon.png')} style={styles.swapIcon} />
        <Text style={styles.toggleText}>Сумма</Text>
      </View>
    </View>

    <View style={styles.inputContainer}>
      <TouchableOpacity style={styles.roundButtonMinus} onPress={decrease}>
        <Image source={require('@/assets/minus-icon.png')} style={styles.icon} />
      </TouchableOpacity>
      <FormInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        textAlign="center"
      />
      <TouchableOpacity style={styles.roundButtonPlus} onPress={increase}>
        <Image source={require('@/assets/plus-icon.png')} style={styles.icon} />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  formGroup: { marginBottom: 20 },
  toggleContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  toggleText: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  toggleSwitch: { flexDirection: "row", gap: 5 },
  swapIcon: { width: 16, height: 16, tintColor: "#fff" },
  inputContainer: { flex: 1, position: "relative" },
  roundButtonMinus: { position: "absolute", left: 5, top: "25%" },
  roundButtonPlus: { position: "absolute", right: 5, top: "25%" },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  icon: { width: 24, height: 24 },
});
