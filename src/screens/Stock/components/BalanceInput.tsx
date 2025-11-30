import { View, Text, StyleSheet } from "react-native";
import FormInput from "@/components/FormInput";

type Props = { value: string; onChange: (val: string) => void };

export const BalanceInput: React.FC<Props> = ({ value, onChange }) => (
  <View>
    <Text style={styles.label}>Свободные средства</Text>
    <FormInput value={value} onChangeText={onChange} />
  </View>
);

const styles = StyleSheet.create({
  label: { color: "rgba(250,250,250,1)", fontSize: 12, marginBottom: 6, marginLeft: 4 },
});
