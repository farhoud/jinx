import { View, StyleSheet, ScrollView } from "react-native"
import { Text } from "../components/Text"

import { TemperatureGauge } from "../components/TemperatureGauge"

export default function TemperatureGaugeDemo() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Temperature Gauge Examples</Text>

      <View style={styles.example}>
        <Text style={styles.exampleTitle}>Standard Thermometer (45°C)</Text>
        <TemperatureGauge
          temperature={45}
          minTemp={0}
          maxTemp={100}
          tempSegments={[
            { to: 0, color: "#4A90E2" },
            { to: 30, color: "#EA4228" },
            { to: 70, color: "#F5CD19" },
            { to: 100, color: "#5BE12C" },
          ]}
        />
      </View>

      <View style={styles.example}>
        <Text style={styles.exampleTitle}>Freezer Mode (-10°C)</Text>
        <TemperatureGauge
          temperature={-10}
          minTemp={-30}
          maxTemp={0}
          tempSegments={[
            { to: -18, color: "#1E90FF" },
            { to: -5, color: "#87CEEB" },
            { to: 0, color: "#B0E0E6" },
          ]}
        />
      </View>

      <View style={styles.example}>
        <Text style={styles.exampleTitle}>Engine Temperature (85°C)</Text>
        <TemperatureGauge
          temperature={85}
          minTemp={50}
          maxTemp={120}
          tempSegments={[
            { to: 60, color: "#5BE12C" },
            { to: 90, color: "#F5CD19" },
            { to: 120, color: "#EA4228" },
          ]}
          size={200}
        />
      </View>

      <View style={styles.example}>
        <Text style={styles.exampleTitle}>Out of Bounds (120°C)</Text>
        <TemperatureGauge temperature={120} minTemp={0} maxTemp={100} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
    flex: 1,
    padding: 20,
  },
  example: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    elevation: 3,
    marginBottom: 20,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
})
