import { View, StyleSheet } from "react-native"
import { Text } from "../components/Text"
import { TemperatureGauge } from "../components/TemperatureGauge"

export default function NeedlePositionTest() {
  return (
    <View style={styles.container}>
      <Text text="🎯 Needle Position Verification" style={styles.title} />

      <Text text="Test 1: temperature={0} minTemp={0} maxTemp={100}" style={styles.subtitle} />
      <TemperatureGauge temperature={0} minTemp={0} maxTemp={100} />
      <Text text="Expected: Needle at LEFT (0%)" style={styles.expectation} />

      <Text text="Test 2: temperature={50} minTemp={0} maxTemp={100}" style={styles.subtitle} />
      <TemperatureGauge temperature={50} minTemp={0} maxTemp={100} />
      <Text text="Expected: Needle at CENTER (50%)" style={styles.expectation} />

      <Text text="Test 3: temperature={100} minTemp={0} maxTemp={100}" style={styles.subtitle} />
      <TemperatureGauge temperature={100} minTemp={0} maxTemp={100} />
      <Text text="Expected: Needle at RIGHT (100%)" style={styles.expectation} />

      <Text text="Test 4: temperature={50} minTemp={0} maxTemp={120}" style={styles.subtitle} />
      <TemperatureGauge temperature={50} minTemp={0} maxTemp={120} />
      <Text text="Expected: Needle at 42% (50/120)" style={styles.expectation} />

      <Text text="Test 5: temperature={-10} minTemp={-30} maxTemp={0}" style={styles.subtitle} />
      <TemperatureGauge temperature={-10} minTemp={-30} maxTemp={0} />
      <Text text="Expected: Needle at 67% (-10 is 67% from -30 to 0)" style={styles.expectation} />

      <Text
        text="✅ Fixed: Removed double angle offset in needle calculation"
        style={styles.success}
      />
      <Text
        text="✅ Fixed: Needle and ticks now use consistent angle calculation"
        style={styles.success}
      />
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
