import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export const Actions = () => (
  <>
    <TouchableOpacity style={styles.buyButton}>
      <Text style={styles.buyButtonText}>Купить</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.topUpButton}>
      <Text style={styles.topUpText}>Как пополнить?</Text>
    </TouchableOpacity>
  </>
);

const styles = StyleSheet.create({
  buyButton: { backgroundColor: "#fff", borderRadius: 12, paddingVertical: 16, marginBottom: 16, alignItems: "center" },
  buyButtonText: { color: "#0e1b36", fontSize: 18, fontWeight: "600" },
  topUpButton: { borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  topUpText: { color: "#fff", fontSize: 16 },
});
