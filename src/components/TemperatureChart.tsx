import React, { useState, useEffect } from "react"
import { View, StyleProp, ViewStyle, TextStyle } from "react-native"
import { LineChart } from "react-native-gifted-charts"

import { useTemperatureDevice } from "@/context/TemperatureDeviceContext"
import useTemperatureMonitor from "@/hooks/useTemperatureMonitor"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

import { Button } from "./Button"
import { Card } from "./Card"
import { Icon } from "./Icon"
import { Text } from "./Text"

// --- Constants ---
const MAX_DATA_POINTS = 200

// Define the shape of the data point for gifted-charts
interface ChartDataPoint {
  value: number // Raw data line
  dataPointText?: string
  label?: string
}

interface TemperatureChartProps {
  /**
   * Optional style override for the container.
   */
  style?: StyleProp<ViewStyle>
}

/**
 * Displays a live line chart of the temperature readings, showing both raw and smoothed data.
 * @param {TemperatureChartProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
export function TemperatureChart({ style }: TemperatureChartProps) {
  const { temperatureReading } = useTemperatureDevice()
  const { themed, theme } = useAppTheme()
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [smoothChartData, setSmoothChartData] = useState<ChartDataPoint[]>([])
  const [showSmooth, setShowSmooth] = useState(false)

  // 1. Initialize the Temperature Monitor Hook
  const { smoothed, ratePerSecond, ratePerMinute, push } = useTemperatureMonitor({
    alphaTemp: 0.1,
    alphaRate: 0.2,
  })

  // 2. Data Management and Chart Update Logic
  useEffect(() => {
    if (temperatureReading !== null && temperatureReading !== undefined) {
      const timeMs = Date.now()

      // Push the new raw reading into the smoothing monitor
      push(temperatureReading, timeMs)

      // Note: The 'smoothed' state will update asynchronously after 'push' is called,
      // but we will use the immediately available 'smoothed' state from the current render cycle.
    }
  }, [temperatureReading, push])

  // 3. Update Chart Data when EITHER raw or smoothed value changes
  useEffect(() => {
    if (temperatureReading !== null && temperatureReading !== undefined) {
      const now = new Date()

      const newPoint: ChartDataPoint = {
        value: temperatureReading, // Raw data (Line 1)
        // dataPointText: temperatureReading.toFixed(1),
        // label: `${now.getMinutes()}:${now.getSeconds()}`,
      }

      setChartData((prevData) => {
        const nextData = [...prevData, newPoint]

        // Keep only the last N data points
        if (nextData.length > MAX_DATA_POINTS) {
          nextData.shift()
        }

        return nextData
      })
    }
  }, [temperatureReading]) // Triggered by both raw and smoothed updates

  useEffect(() => {
    if (smoothed !== null && smoothed !== undefined && smoothed > 0) {
      const now = new Date()

      const newPoint: ChartDataPoint = {
        value: smoothed, // Smoothed data (Line 2)
        // dataPointText: temperatureReading.toFixed(1),
        // label: `${now.getMinutes()}:${now.getSeconds()}`,
      }

      setSmoothChartData((prevData) => {
        const nextData = [...prevData, newPoint]

        // Keep only the last N data points
        if (nextData.length > MAX_DATA_POINTS) {
          nextData.shift()
        }

        return nextData
      })
    }
  }, [smoothed])

  const currentTemp = showSmooth ? smoothed : temperatureReading
  const displayData = showSmooth ? smoothChartData : chartData

  return (
    <Card
      style={themed([$container, style])}
      content="Temperature Chart"
      ContentComponent={
        <View>
          <View style={themed($header)}>
            <View style={themed($toggleContainer)}>
              <Button
                text="Raw"
                preset={showSmooth ? "default" : "filled"}
                onPress={() => setShowSmooth(false)}
                style={themed($toggleButton)}
              />
              <Button
                text="Smooth"
                preset={showSmooth ? "filled" : "default"}
                onPress={() => setShowSmooth(true)}
                style={themed($toggleButton)}
              />
            </View>
            <View style={themed($statsContainer)}>
              <View style={themed($tempContainer)}>
                <Icon lucideIcon="Thermometer" size={20} color={theme.colors.tint} />
                <Text
                  text={`${currentTemp?.toFixed(1) || "--"}°C`}
                  preset="heading"
                  size="md"
                  style={themed($tempText)}
                />
              </View>
              <View style={themed($rateContainer)}>
                <Icon lucideIcon="TrendingUp" size={16} color={theme.colors.palette.accent500} />
                <Text text={`${ratePerMinute.toFixed(2)}°`} size="sm" style={themed($rateText)} />
              </View>
            </View>
          </View>

          <View style={themed($chartContainer)}>
            <LineChart
              data={displayData}
              width={300}
              height={200}
              spacing={4}
              color={showSmooth ? theme.colors.palette.accent500 : theme.colors.palette.primary500}
              thickness={3}
              yAxisOffset={15}
              yAxisLabelSuffix="°"
              hideDataPoints
              noOfSections={4}
              scrollToEnd
              scrollAnimation
              rulesColor={theme.colors.border}
              yAxisTextStyle={{ color: theme.colors.text }}
              backgroundColor={theme.colors.background}
            />
          </View>
        </View>
      }
    ></Card>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  margin: spacing.md,
  padding: spacing.md,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  ...$styles.row,
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.md,
})

const $toggleContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  ...$styles.row,
  gap: spacing.xs,
})

const $toggleButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minWidth: 60,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
})

const $statsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  ...$styles.row,
  alignItems: "center",
  gap: spacing.md,
})

const $tempContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  ...$styles.row,
  alignItems: "center",
  gap: spacing.xs,
})

const $tempText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
})

const $rateContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  ...$styles.row,
  alignItems: "center",
  gap: spacing.xs,
})

const $rateText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.accent500,
})

const $chartContainer: ViewStyle = {
  alignItems: "center",
}
