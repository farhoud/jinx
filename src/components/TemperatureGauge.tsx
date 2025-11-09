import { View, StyleSheet } from "react-native"

import { CustomGauge, Segment } from "./CustomGauge"

export type TempSegment = {
  to: number // Temperature value (not percentage)
  color: string
  width?: number
}

type Props = {
  temperature: number
  minTemp?: number
  maxTemp?: number
  tempSegments?: TempSegment[] // Temperature-based segments
  size?: number
  arcWidth?: number
  springConfig?: {
    damping?: number
    stiffness?: number
  }
  accessibilityLabel?: string
}

// Convert temperature-based segments to gauge segments (0-1 progress)
const convertTempSegmentsToGaugeSegments = (
  tempSegments: TempSegment[],
  minTemp: number,
  maxTemp: number,
): Segment[] => {
  const range = maxTemp - minTemp
  return tempSegments
    .sort((a, b) => a.to - b.to)
    .map((seg) => ({
      to: (seg.to - minTemp) / range, // Convert temperature to 0-1 progress
      color: seg.color,
      width: seg.width,
    }))
}

export const TemperatureGauge: React.FC<Props> = ({
  temperature,
  minTemp = 0,
  maxTemp = 100,
  tempSegments,
  size = 240,
  arcWidth = 20,
  springConfig = { damping: 20, stiffness: 90 },
  accessibilityLabel,
}) => {
  // Default temperature segments if none provided (temperature-based)
  const defaultTempSegments: TempSegment[] = [
    { to: minTemp + (maxTemp - minTemp) * 0.3, color: "#EA4228" }, // Cold (red)
    { to: minTemp + (maxTemp - minTemp) * 0.7, color: "#F5CD19" }, // Medium (yellow)
    { to: maxTemp, color: "#5BE12C" }, // Hot (green)
  ]

  const segments = tempSegments || defaultTempSegments

  // Convert temperature segments to gauge segments for CustomGauge
  const gaugeSegments = convertTempSegmentsToGaugeSegments(segments, minTemp, maxTemp)

  const defaultAccessibilityLabel = `Current temperature is ${Math.round(temperature)} degrees Celsius`

  return (
    <View
      style={styles.container}
      accessibilityLabel={accessibilityLabel || defaultAccessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: minTemp, max: maxTemp, now: temperature }}
    >
      <CustomGauge
        value={temperature} // Pass actual temperature value
        min={minTemp} // Use new min/max props
        max={maxTemp}
        size={size}
        arcWidth={arcWidth}
        segments={gaugeSegments}
        springConfig={springConfig}
        // tickLabels are now handled automatically by CustomGauge
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
})
