import React from "react"
import { View, Text, StyleSheet } from "react-native"

interface TemperatureDisplayWidgetProps {
  currentTemp: number | null
  ratePerMinute: number
  tempColor: string
}

const TemperatureDisplayWidget: React.FC<TemperatureDisplayWidgetProps> = ({
  currentTemp,
  ratePerMinute,
  tempColor,
}) => {
  return (
    <View style={styles.tempSection}>
      <Text style={[styles.tempValue, { color: tempColor }]}>
        {currentTemp !== null ? `${currentTemp.toFixed(1)}°C` : "--"}
      </Text>
      <Text style={styles.tempSub}>Rate: {ratePerMinute.toFixed(2)}°C/min</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  tempSection: { alignItems: "center", marginVertical: 24 },
  tempSub: { color: "#ccc", fontSize: 18, marginTop: 4 },
  tempValue: { fontSize: 72, fontWeight: "900" },
})

export default TemperatureDisplayWidget
