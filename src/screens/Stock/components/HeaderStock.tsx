import { View, Text, Pressable, Image, StyleSheet } from "react-native";

type Props = { onBack: () => void };

export const HeaderStock: React.FC<Props> = ({ onBack }) => (
  <View style={styles.header}>
    <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
      <Image source={require('@/assets/left-arrow.png')} style={styles.leftArrowIcon} />
    </Pressable>
    <Text style={styles.title}>Купить акцию</Text>
    <View style={{ width: 22 }} />
  </View>
);

const styles = StyleSheet.create({
  header: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { padding: 4 },
  leftArrowIcon: { width: 22, height: 18, resizeMode: "contain" },
  title: { fontSize: 22, color: "#fff", fontWeight: "600" },
});
