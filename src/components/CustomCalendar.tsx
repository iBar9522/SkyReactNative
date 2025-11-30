import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';

interface Props {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  isRangePicker?: boolean;
  valueFrom?: string;
  valueTo?: string;
  onRangeChange?: (from: string, to: string) => void;
  visible?: boolean;
  onClose?: () => void;
}

export const CustomCalendar: React.FC<Props> = ({
  value,
  onChange,
  placeholder = 'дд/мм/гггг',
  label,
  isRangePicker = false,
  valueFrom = '',
  valueTo = '',
  onRangeChange,
  visible: externalVisible,
  onClose,
}) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const visible = externalVisible !== undefined ? externalVisible : internalVisible;
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedFrom, setSelectedFrom] = useState<Date | null>(null);
  const [selectedTo, setSelectedTo] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let dayOfWeek = firstDay.getDay();
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const days: (number | null)[] = [];
    
    for (let i = 0; i < dayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -i).getDate();
      days.unshift(prevMonthDay);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(i);
    }
    
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push(i);
      }
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return null;
  };

  const handleDayPress = (day: number | null) => {
    if (day === null) return;
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const selected = new Date(year, month, day);
    
    if (isRangePicker) {
      if (!selectedFrom || (selectedFrom && selectedTo)) {
        // Start new range
        setSelectedFrom(selected);
        setSelectedTo(null);
      } else {
        // Complete range
        if (selected < selectedFrom) {
          setSelectedTo(selectedFrom);
          setSelectedFrom(selected);
        } else {
          setSelectedTo(selected);
        }
      }
    } else {
      setSelectedDate(selected);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const closeModal = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalVisible(false);
    }
  };

  const handleSave = () => {
    if (isRangePicker) {
      if (selectedFrom && selectedTo && onRangeChange) {
        onRangeChange(formatDate(selectedFrom), formatDate(selectedTo));
      }
    } else {
      if (selectedDate) {
        onChange(formatDate(selectedDate));
      }
    }
    closeModal();
  };

  const handleReset = () => {
    if (isRangePicker) {
      setSelectedFrom(null);
      setSelectedTo(null);
      if (onRangeChange) {
        onRangeChange('', '');
      }
    } else {
      setSelectedDate(null);
      onChange('');
    }
    closeModal();
  };

  const openCalendar = () => {
    if (isRangePicker) {
      if (valueFrom) {
        const parsed = parseDate(valueFrom);
        if (parsed) {
          setSelectedFrom(parsed);
          setCurrentMonth(new Date(parsed.getFullYear(), parsed.getMonth()));
        }
      }
      if (valueTo) {
        const parsed = parseDate(valueTo);
        if (parsed) setSelectedTo(parsed);
      }
    } else {
      if (value) {
        const parsed = parseDate(value);
        if (parsed) {
          setSelectedDate(parsed);
          setCurrentMonth(new Date(parsed.getFullYear(), parsed.getMonth()));
        }
      }
    }
    setInternalVisible(true);
  };

  const days = getDaysInMonth(currentMonth);
  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number | null) => {
    if (!day) return false;
    if (isRangePicker) {
      return isInRange(day) || isRangeStart(day) || isRangeEnd(day);
    }
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isRangeStart = (day: number | null) => {
    if (!day || !selectedFrom) return false;
    return (
      day === selectedFrom.getDate() &&
      currentMonth.getMonth() === selectedFrom.getMonth() &&
      currentMonth.getFullYear() === selectedFrom.getFullYear()
    );
  };

  const isRangeEnd = (day: number | null) => {
    if (!day || !selectedTo) return false;
    return (
      day === selectedTo.getDate() &&
      currentMonth.getMonth() === selectedTo.getMonth() &&
      currentMonth.getFullYear() === selectedTo.getFullYear()
    );
  };

  const isInRange = (day: number | null) => {
    if (!day || !selectedFrom || !selectedTo) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date > selectedFrom && date < selectedTo;
  };

  return (
    <>
      {!externalVisible && (
        <View style={styles.container}>
          {label && <Text style={styles.label}>{label}</Text>}
          
     
        </View>
      )}

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
        presentationStyle="overFullScreen"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                <Text style={styles.navText}>{'<'}</Text>
              </TouchableOpacity>
              <Text style={styles.monthYear}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                <Text style={styles.navText}>{'>'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekDays}>
              {weekDays.map((day, index) => (
                <Text key={index} style={styles.weekDay}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {days.map((day, index) => {
                const isCurrentMonth = index >= getDaysInMonth(currentMonth).indexOf(1) &&
                  index < getDaysInMonth(currentMonth).lastIndexOf(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate());
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      isSelected(day) && styles.selectedDay,
                      isInRange(day) && styles.inRangeDay,
                    ]}
                    onPress={() => handleDayPress(day)}
                    disabled={!day}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !isCurrentMonth && styles.otherMonthDay,
                        isSelected(day) && styles.selectedDayText,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
                <Text style={styles.resetButtonText}>Сбросить</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Montserrat',
  },
  placeholder: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: '#2d3f5f',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  monthYear: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Montserrat',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDay: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '500',
    width: 40,
    textAlign: 'center',
    fontFamily: 'Montserrat',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  dayText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat',
  },
  otherMonthDay: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  selectedDay: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '700',
  },
  inRangeDay: {
    backgroundColor: 'rgba(74, 144, 226, 0.3)',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  resetButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat',
  },
  saveButton: {
    backgroundColor: '#A8B5C8',
  },
  saveButtonText: {
    color: '#212121',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat',
  },
});

export default CustomCalendar;

