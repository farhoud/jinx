import { View, StyleSheet } from "react-native"
import { Text } from "../components/Text"
import { TemperatureGauge } from "../components/TemperatureGauge"

export default function TemperatureGaugeFixed() {
  return (
    <View style={styles.container}>
      <Text text="TemperatureGauge Fixed Demo" style={styles.title} />

      <Text text="Issue: temperature={50} minTemp={0} maxTemp={120}" style={styles.subtitle} />
      <TemperatureGauge temperature={50} minTemp={0} maxTemp={120} />

      <Text
        text="✅ Now shows: Needle at 42% (50/120), Center: 50°C, Ticks: 0-120"
        style={styles.success}
      />

      <Text text="Default range (0-100) with temp=75:" style={styles.subtitle} />
      <TemperatureGauge temperature={75} />

      <Text text="Negative range (-30 to 0) with temp=-10:" style={styles.subtitle} />
      <TemperatureGauge temperature={-10} minTemp={-30} maxTemp={0} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  success: {
    fontSize: 14,
    color: "#5BE12C",
    marginTop: 10,
    textAlign: "center",
    fontWeight: "600",
  },
})
