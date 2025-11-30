import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";

type LabeledSwitchProps = {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
};

const LabeledSwitch: React.FC<LabeledSwitchProps> = ({ label, value, onValueChange }) => {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor="#fff"
        trackColor={{ false: "#555", true: "#3376F6" }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
	switchRow: {
	 flexDirection: 'row',
	 justifyContent: 'space-between',
	 alignItems: 'center',
	  paddingVertical: 14,
		paddingHorizontal: 8,
		backgroundColor: 'rgba(255, 255, 255, 0.05)',
		borderRadius: 10,
		marginBottom: 12,
	},
	switchLabel: {
		color: '#fff',
		fontSize: 14,
		fontFamily: 'Montserrat',
	},
});

export default LabeledSwitch;
