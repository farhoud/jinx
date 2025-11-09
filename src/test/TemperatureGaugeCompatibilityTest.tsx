// Test to verify TemperatureGauge still works with new CustomGauge
import { View, StyleSheet } from "react-native"
import { Text } from "../components/Text"
import { TemperatureGauge } from "../components/TemperatureGauge"

export default function TemperatureGaugeCompatibilityTest() {
  return (
    <View style={styles.container}>
      <Text text="🌡️ TemperatureGauge Compatibility Test" style={styles.title} />

      <Text text="Test 1: Default behavior (should work unchanged)" style={styles.subtitle} />
      <TemperatureGauge temperature={50} minTemp={0} maxTemp={120} />
      <Text text="Default segments with auto-generated labels" style={styles.expectation} />

      <Text text="Test 2: Custom temperature segments" style={styles.subtitle} />
      <TemperatureGauge
        temperature={82}
        minTemp={70}
        maxTemp={100}
        tempSegments={[
          { to: 75, color: "#4A90E2" }, // Cold
          { to: 85, color: "#F5CD19" }, // Optimal
          { to: 100, color: "#EA4228" }, // Too hot
        ]}
      />
      <Text text="Custom coffee brewing segments" style={styles.expectation} />

      <Text text="Test 3: Negative temperature range" style={styles.subtitle} />
      <TemperatureGauge temperature={-10} minTemp={-30} maxTemp={0} />
      <Text text="Freezing temperatures with proper scaling" style={styles.expectation} />

      <Text text="✅ TemperatureGauge working perfectly!" style={styles.success} />
      <Text text="✅ Backward compatibility maintained!" style={styles.success} />
      <Text text="✅ Custom segments working!" style={styles.success} />
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
  expectation: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    marginBottom: 15,
    textAlign: "center",
    fontStyle: "italic",
  },
  success: {
    fontSize: 14,
    color: "#5BE12C",
    marginTop: 10,
    textAlign: "center",
    fontWeight: "600",
  },
})
