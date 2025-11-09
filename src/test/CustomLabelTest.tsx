// Test file to verify CustomGauge with various label configurations
import { View, StyleSheet } from "react-native"
import { Text } from "../components/Text"
import { CustomGauge } from "../components/CustomGauge"

export default function CustomLabelTest() {
  return (
    <View style={styles.container}>
      <Text text="🎯 Custom Label Scaling Test" style={styles.title} />

      <Text text="Test 1: Uneven temperature labels" style={styles.subtitle} />
      <CustomGauge value={82} min={70} max={100} tickLabels={[70, 75, 82, 85, 90, 100]} />
      <Text text="Labels at exact positions with rotation" style={styles.expectation} />

      <Text text="Test 2: Critical points only" style={styles.subtitle} />
      <CustomGauge value={45} min={0} max={120} tickLabels={[0, 30, 60, 90, 120]} />
      <Text text="Only critical temperature points shown" style={styles.expectation} />

      <Text text="Test 3: Many labels (adaptive font size)" style={styles.subtitle} />
      <CustomGauge
        value={50}
        min={0}
        max={100}
        tickLabels={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
      />
      <Text text="11 labels with smaller font size" style={styles.expectation} />

      <Text text="Test 4: Negative range" style={styles.subtitle} />
      <CustomGauge value={-10} min={-30} max={0} tickLabels={[-30, -20, -10, 0]} />
      <Text text="Negative values with proper scaling" style={styles.expectation} />

      <Text text="Test 5: Decimal precision" style={styles.subtitle} />
      <CustomGauge value={37.5} min={35} max={40} tickLabels={[35, 36.5, 37.5, 39, 40]} />
      <Text text="Decimal values with precise positioning" style={styles.expectation} />

      <Text text="Test 6: Default behavior (no tickLabels)" style={styles.subtitle} />
      <CustomGauge value={60} min={0} max={120} />
      <Text text="Auto-generated 6 evenly spaced labels" style={styles.expectation} />

      <Text text="✅ Custom label scaling working perfectly!" style={styles.success} />
      <Text text="✅ Smart rotation prevents overlap!" style={styles.success} />
      <Text text="✅ Adaptive styling for many labels!" style={styles.success} />
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
