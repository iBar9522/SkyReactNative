import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

export const DatePickerField: React.FC<Props> = ({ value, onChange }) => {
  const [tempDate, setTempDate] = useState(value);
  const [visible, setVisible] = useState(false);

  const formatDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Сегодня";
    if (diff === 1) return "1 день";
    if (diff <= 4) return `${diff} дня`;
    if (diff <= 31) return `${diff} дней`;
    const months = Math.round(diff / 30);
    if (months === 1) return "1 месяц";
    if (months <= 4) return `${months} месяца`;
    return `${months} месяцев`;
  };

  return (
    <>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Срок действия</Text>
        <TouchableOpacity style={styles.durationContainer} onPress={() => setVisible(true)}>
          <Text style={styles.durationText}>{formatDate(value)}</Text>
          <Image source={require('@/assets/calendar-icon.png')} style={styles.calendarIcon} />
        </TouchableOpacity>
      </View>

      {visible && (
        <Modal transparent animationType="slide" visible={visible} onRequestClose={() => setVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => setVisible(false)}>
                  <Text style={styles.cancelText}>Отмена</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Выберите дату</Text>
                <TouchableOpacity
                  onPress={() => {
                    onChange(tempDate);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.doneText}>Готово</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={(_, date) => date && setTempDate(date)}
                minimumDate={new Date()}
                maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
                style={{ backgroundColor: "transparent" }}
              />
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  formGroup: { marginBottom: 20 },
  label: { color: "rgba(250,250,250,0.8)", fontSize: 14, marginBottom: 8 },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  durationText: { color: "#fff", fontSize: 16 },
  calendarIcon: { width: 20, height: 20, tintColor: "#fff" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#1a2b47", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" },
  cancelText: { color: "rgba(255,255,255,0.8)", fontSize: 16 },
  doneText: { color: "#007AFF", fontSize: 16, fontWeight: "600" },
  title: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
