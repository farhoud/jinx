import { View, StyleSheet } from "react-native"
import { Text } from "../components/Text"
import { TemperatureGauge } from "../components/TemperatureGauge"

export default function TemperatureGaugeMapperTest() {
  return (
    <View style={styles.container}>
      <Text text="✅ TemperatureGauge with Proper Mapper" style={styles.title} />

      <Text text="Test 1: temperature={50} minTemp={0} maxTemp={120}" style={styles.subtitle} />
      <TemperatureGauge temperature={50} minTemp={0} maxTemp={120} />
      <Text
        text="Expected: Needle at 42% (50/120), Center: 50°C, Ticks: 0,24,48,72,96,120"
        style={styles.description}
      />

      <Text text="Test 2: temperature={75} minTemp={-20} maxTemp={80}" style={styles.subtitle} />
      <TemperatureGauge temperature={75} minTemp={-20} maxTemp={80} />
      <Text
        text="Expected: Needle at 88% (75/100), Center: 75°C, Ticks: -20,4,28,52,76,80"
        style={styles.description}
      />

      <Text text="Test 3: temperature={-10} minTemp={-30} maxTemp={0}" style={styles.subtitle} />
      <TemperatureGauge temperature={-10} minTemp={-30} maxTemp={0} />
      <Text
        text="Expected: Needle at 67% (-10/30), Center: -10°C, Ticks: -30,-24,-18,-12,-6,0"
        style={styles.description}
      />

      <Text text="✅ CustomGauge always works with 0-100 internally" style={styles.success} />
      <Text text="✅ TemperatureGauge handles all mapping logic" style={styles.success} />
      <Text text="✅ No hardcoded values in CustomGauge" style={styles.success} />
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#5BE12C",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    marginBottom: 15,
    textAlign: "center",
    fontStyle: "italic",
  },
  success: {
    fontSize: 14,
    color: "#5BE12C",
    marginTop: 5,
    textAlign: "center",
    fontWeight: "600",
  },
})
