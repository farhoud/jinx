import { View, StyleSheet } from "react-native"
import { Text } from "../components/Text"
import { TemperatureGauge } from "../components/TemperatureGauge"

export default function TestGauge() {
  return (
    <View style={styles.container}>
      <Text text="Testing Temperature Gauge with 0-120 range" style={styles.title} />

      <TemperatureGauge temperature={50} minTemp={0} maxTemp={120} />

      <Text
        text="Expected: Needle at ~42% (50/120), Center shows 50°C, Ticks show 0-120"
        style={styles.description}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    marginTop: 20,
    textAlign: "center",
    opacity: 0.7,
  },
})
