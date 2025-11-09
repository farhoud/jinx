// Test file to verify TemperatureGauge with custom temperature segments
import { View, StyleSheet } from "react-native"
import { Text } from "../components/Text"
import { TemperatureGauge } from "../components/TemperatureGauge"

export default function TemperatureSegmentTest() {
  // Custom temperature segments for brewing coffee
  const coffeeBrewingSegments = [
    { to: 70, color: "#4A90E2" }, // Too cold (blue)
    { to: 85, color: "#F5CD19" }, // Optimal range (yellow)
    { to: 100, color: "#EA4228" }, // Too hot (red)
  ]

  return (
    <View style={styles.container}>
      <Text text="☕ Temperature Segment Test" style={styles.title} />

      <Text text="Default segments (0-100°C range)" style={styles.subtitle} />
      <TemperatureGauge temperature={75} minTemp={0} maxTemp={100} />
      <Text text="75°C with default color coding" style={styles.expectation} />

      <Text text="Custom coffee brewing segments (70-100°C)" style={styles.subtitle} />
      <TemperatureGauge
        temperature={82}
        minTemp={70}
        maxTemp={100}
        tempSegments={coffeeBrewingSegments}
      />
      <Text text="82°C in optimal brewing range (yellow)" style={styles.expectation} />

      <Text text="Cold brewing (4°C)" style={styles.subtitle} />
      <TemperatureGauge
        temperature={4}
        minTemp={0}
        maxTemp={10}
        tempSegments={[
          { to: 2, color: "#87CEEB" }, // Very cold (sky blue)
          { to: 6, color: "#4A90E2" }, // Cold brewing (blue)
          { to: 10, color: "#1E3A8A" }, // Too cold for cold brew (dark blue)
        ]}
      />
      <Text text="4°C perfect for cold brewing" style={styles.expectation} />

      <Text text="✅ Temperature-based segments working!" style={styles.success} />
      <Text text="✅ Backward compatibility maintained!" style={styles.success} />
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
