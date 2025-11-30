import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Image,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
}

export const CustomDateTimePicker: React.FC<Props> = ({ 
  value, 
  onChange, 
  placeholder = "дд/мм/гггг",
  label 
}) => {
  const currentDate = new Date();
  const [date, setDate] = useState(currentDate);
  const [tempDate, setTempDate] = useState(currentDate);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDate = (dateString: string) => {
    if (!dateString) return new Date();
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; 
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date();
  };

  const handleDateConfirm = () => {
    setDate(tempDate);
    const formattedDate = formatDate(tempDate);
    onChange(formattedDate);
    setDatePickerVisible(false);
  };

  const handleDateCancel = () => {
    setTempDate(date);
    setDatePickerVisible(false);
  };

  const openDatePicker = () => {
    if (value) {
      const parsedDate = parseDate(value);
      setDate(parsedDate);
      setTempDate(parsedDate);
    } else {
      
      const currentDate = new Date();
      setDate(currentDate);
      setTempDate(currentDate);
    }
    setDatePickerVisible(true);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity 
        style={styles.inputContainer}
        onPress={openDatePicker}
        activeOpacity={0.7}
      >
        <TextInput
          style={styles.dateInput}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          editable={false}
          pointerEvents="none"
        />
        <View style={styles.calendarButton}>
          <Image 
            source={require('@/assets/calendar-icon.png')} 
            style={styles.calendarIcon}
          />
        </View>
      </TouchableOpacity>


      {datePickerVisible && (
        <Modal
          transparent
          animationType="slide"
          visible={datePickerVisible}
          onRequestClose={() => setDatePickerVisible(false)}
          presentationStyle="overFullScreen"
          statusBarTranslucent
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                  <Text style={styles.cancelText}>Отмена</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Выберите дату</Text>
                <TouchableOpacity
                  onPress={() => {
                    onChange(formatDate(tempDate));
                    setDatePickerVisible(false);
                  }}
                >
                  <Text style={styles.doneText}>Готово</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => date && setTempDate(date)}
                style={styles.datePicker}
                themeVariant="dark"
                minimumDate={new Date(1900, 0, 1)}
                maximumDate={new Date()}
              />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
    fontFamily: 'Montserrat',
  },
  inputContainer: {
    position: 'relative',
  },
  dateInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 60,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    fontFamily: 'Montserrat',
  },
  calendarButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    padding: 4,
  },
  calendarIcon: {
    width: 24,
    height: 24,
    tintColor: 'rgba(255, 255, 255, 0.7)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: '#1a2b47',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Montserrat',
  },
  cancelText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontFamily: 'Montserrat',
  },
  doneText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat',
  },
  datePickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  datePicker: {
    backgroundColor: 'transparent',
    alignSelf: 'center',
    width: '100%',
    height: 180,
  },
});

export default CustomDateTimePicker;
