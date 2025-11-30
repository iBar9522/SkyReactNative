import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image } from "react-native";

const orderTypes = ["Не дороже", "По рынку", "Лимитная"];

type Props = { value: string; onChange: (val: string) => void };

export const OrderTypeSelect: React.FC<Props> = ({ value, onChange }) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Тип заявки</Text>
        <TouchableOpacity style={styles.selectContainer} onPress={() => setVisible(true)}>
          <Text style={styles.selectText}>{value}</Text>
          <Image source={require('@/assets/dropdown.png')} style={styles.chevronIcon} />
        </TouchableOpacity>
      </View>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выберите тип заявки</Text>
            {orderTypes.map((type, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalOption}
                onPress={() => {
                  onChange(type);
                  setVisible(false);
                }}
              >
                <Text style={[styles.modalOptionText, value === type && styles.modalOptionTextSelected]}>{type}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setVisible(false)}>
              <Text style={styles.modalCloseText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  formGroup: { marginBottom: 20 },
  label: { color: "rgba(250,250,250,0.8)", fontSize: 14, marginBottom: 8 },
  selectContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  selectText: { color: "#fff", fontSize: 16 },
  chevronIcon: { width: 20, height: 20, tintColor: "#fff" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#1a2b47", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "600", textAlign: "center", marginBottom: 20 },
  modalOption: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" },
  modalOptionText: { color: "rgba(255,255,255,0.8)", fontSize: 16 },
  modalOptionTextSelected: { color: "#007AFF", fontWeight: "600" },
  modalCloseButton: { marginTop: 20, paddingVertical: 16, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12 },
  modalCloseText: { color: "#fff", fontSize: 16, textAlign: "center" },
});
