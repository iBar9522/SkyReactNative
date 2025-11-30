import { View, Text, Image, StyleSheet } from "react-native";

export const IdeaHeader = () => (
  <View style={styles.container}>
    <View style={styles.logoCircle}>
      <Image source={require('@/assets/amazon.png')} style={styles.logoImage} />
    </View>
    <View style={styles.info}>
      <Text style={styles.title}>Skyworks Solutions Inc.</Text>
      <Text style={styles.price}>130.07 USD</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  logoCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" },
  logoImage: { width: 28, height: 28, resizeMode: "contain" },
  info: { flex: 1, marginLeft: 16 },
  title: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 4 },
  price: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
});
