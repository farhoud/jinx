import { useEffect, useMemo } from "react"
import { View, StyleSheet } from "react-native"
import { Text } from "./Text"
import Animated, { useSharedValue, useAnimatedProps, withSpring } from "react-native-reanimated"
import Svg, { Path, Line, Circle, Text as SvgText } from "react-native-svg"

import { polarToCartesian } from "@/utils/polarToCartesian"

const AnimatedPath = Animated.createAnimatedComponent(Path)

// Constants
const GAUGE_START_ANGLE = -90 // Start from left (9 o'clock position)
const GAUGE_SWEEP_ANGLE = 180 // Semi-circle (180 degrees)
const NEEDLE_LENGTH_RATIO = 0.85
const HUB_RADIUS = 6

export type Segment = {
  to: number // 0-1 progress
  color: string
  width?: number
}

type SpringConfig = {
  damping?: number
  stiffness?: number
  mass?: number
  overshootClamping?: boolean
  restDisplacementThreshold?: number
  restSpeedThreshold?: number
}

type Props = {
  value: number // Actual value in custom range
  min?: number // Default: 0
  max?: number // Default: 100
  size?: number
  arcWidth?: number
  segments?: Segment[]
  springConfig?: SpringConfig
  tickLabels?: number[] // Array of actual values (uneven spacing allowed)
}

// Scale value from custom range to 0-100 for internal gauge calculations
export const scaleToGaugeRange = (value: number, min: number, max: number): number => {
  if (min === max) return 0 // Edge case: zero range
  const clampedValue = Math.max(min, Math.min(max, value))
  return ((clampedValue - min) / (max - min)) * 100
}

// Scale label value to gauge position (0-1)
const scaleLabelToGaugePosition = (labelValue: number, min: number, max: number): number => {
  if (min === max) return 0
  return (labelValue - min) / (max - min)
}

// Validate tick labels
const validateTickLabels = (labels: number[], min: number, max: number): void => {
  if (labels.length === 0) return // No labels is valid

  if (labels.some((label) => label < min || label > max)) {
    throw new Error("CustomGauge: tickLabels values must be within min-max range")
  }

  if (new Set(labels).size !== labels.length) {
    throw new Error("CustomGauge: tickLabels cannot contain duplicate values")
  }
}

// Calculate label rotation for optimal readability
const calculateLabelRotation = (angleDegrees: number): number => {
  if (angleDegrees < -60) return -45 // Left side - rotate clockwise
  if (angleDegrees > 60) return 45 // Right side - rotate counter-clockwise
  return 0 // Center - no rotation
}

// Get text anchor based on angle
const getTextAnchor = (angleDegrees: number): "start" | "middle" | "end" => {
  if (angleDegrees < -75) return "start"
  if (angleDegrees > 75) return "end"
  return "middle"
}

// Get alignment baseline based on angle
const getAlignmentBaseline = (angleDegrees: number): "baseline" | "middle" | "hanging" => {
  if (angleDegrees < -45 || angleDegrees > 45) return "middle"
  return "baseline"
}

// Generate tick labels based on custom range
export const generateTickLabels = (min: number, max: number, customLabels?: number[]): number[] => {
  if (customLabels) return customLabels

  const labels: number[] = []
  const step = (max - min) / 5 // 6 labels (0, 20, 40, 60, 80, 100)

  for (let i = 0; i <= 5; i++) {
    labels.push(min + i * step)
  }

  return labels.map((label) => Math.round(label * 10) / 10) // Round to 1 decimal place
}

export const CustomGauge: React.FC<Props> = ({
  value,
  min = 0,
  max = 100,
  size = 240,
  arcWidth = 20,
  segments = [
    { to: 0.3, color: "#EA4228" },
    { to: 0.7, color: "#F5CD19" },
    { to: 1, color: "#5BE12C" },
  ],
  springConfig = { damping: 20, stiffness: 90 },
  tickLabels,
}) => {
  // Validate range and labels
  if (min >= max) {
    throw new Error("CustomGauge: min must be less than max")
  }

  if (tickLabels) {
    validateTickLabels(tickLabels, min, max)
  }

  // Scale input value to 0-100 range for internal calculations
  const scaledValue = scaleToGaugeRange(value, min, max)
  const clampedValue = Math.max(min, Math.min(max, value))

  // Animation state
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withSpring(scaledValue / 100, springConfig)
  }, [scaledValue, progress, springConfig])

  // Geometry calculations
  const geometry = useMemo(() => {
    const centerX = size / 2
    const centerY = size // Bottom of the circle for semi-circle
    const radius = size / 2 - arcWidth / 2

    return {
      centerX,
      centerY,
      radius,
      needleLength: radius * NEEDLE_LENGTH_RATIO,
    }
  }, [size, arcWidth])

  // Generate segment paths
  const segmentPaths = useMemo(() => {
    const paths: React.ReactNode[] = []
    let previousProgress = 0

    segments.forEach((segment, index) => {
      const startProgress = previousProgress
      const endProgress = segment.to
      const segmentWidth = segment.width ?? arcWidth
      const segmentRadius = size / 2 - segmentWidth / 2

      const startAngle = GAUGE_START_ANGLE + startProgress * GAUGE_SWEEP_ANGLE
      const endAngle = GAUGE_START_ANGLE + endProgress * GAUGE_SWEEP_ANGLE
      const largeArcFlag = endProgress - startProgress > 0.5 ? 1 : 0

      const startPosition = polarToCartesian(
        geometry.centerX,
        geometry.centerY,
        segmentRadius,
        startAngle,
      )
      const endPosition = polarToCartesian(
        geometry.centerX,
        geometry.centerY,
        segmentRadius,
        endAngle,
      )

      const pathData = [
        `M ${startPosition.x} ${startPosition.y}`,
        `A ${segmentRadius} ${segmentRadius} 0 ${largeArcFlag} 1 ${endPosition.x} ${endPosition.y}`,
      ].join(" ")

      paths.push(
        <Path
          key={`segment-${index}`}
          d={pathData}
          stroke={segment.color}
          strokeWidth={segmentWidth}
          strokeLinecap="round"
          fill="none"
        />,
      )

      previousProgress = endProgress
    })

    return paths
  }, [segments, arcWidth, geometry])

  // Background arc path
  const backgroundPath = useMemo(() => {
    const startX = geometry.centerX - geometry.radius
    const endX = geometry.centerX + geometry.radius
    return `M ${startX} ${geometry.centerY} A ${geometry.radius} ${geometry.radius} 0 1 1 ${endX} ${geometry.centerY}`
  }, [geometry])

  // Needle animation
  const needleAnimatedProps = useAnimatedProps(() => {
    // Use same coordinate system as polarToCartesian function
    const angleDegrees = GAUGE_START_ANGLE + progress.value * GAUGE_SWEEP_ANGLE
    const angleRadians = ((angleDegrees - 90) * Math.PI) / 180

    const tipX = geometry.centerX + geometry.needleLength * Math.cos(angleRadians)
    const tipY = geometry.centerY + geometry.needleLength * Math.sin(angleRadians)

    return {
      d: `M ${geometry.centerX} ${geometry.centerY} L ${tipX} ${tipY}`,
    }
  })

  // Generate ticks and labels based on tickLabels
  const ticksAndLabels = useMemo(() => {
    const elements: React.ReactNode[] = []
    const tickOffset = 8
    const labelOffset = 30

    // Use custom tickLabels if provided, otherwise generate default ones
    const labels = tickLabels || generateTickLabels(min, max)

    labels.forEach((labelValue, index) => {
      // Scale label value to gauge position (0-1)
      const position = scaleLabelToGaugePosition(labelValue, min, max)
      const angleDegrees = GAUGE_START_ANGLE + position * GAUGE_SWEEP_ANGLE

      // Generate tick mark at label position
      const innerRadius = geometry.radius - tickOffset
      const outerRadius = geometry.radius + tickOffset

      const innerPosition = polarToCartesian(
        geometry.centerX,
        geometry.centerY,
        innerRadius,
        angleDegrees,
      )
      const outerPosition = polarToCartesian(
        geometry.centerX,
        geometry.centerY,
        outerRadius,
        angleDegrees,
      )

      // Tick mark
      elements.push(
        <Line
          key={`tick-${index}`}
          x1={innerPosition.x}
          y1={innerPosition.y}
          x2={outerPosition.x}
          y2={outerPosition.y}
          stroke="#777"
          strokeWidth={2}
        />,
      )

      // Label with smart rotation and positioning
      const labelRadius = geometry.radius - labelOffset
      const labelPosition = polarToCartesian(
        geometry.centerX,
        geometry.centerY,
        labelRadius,
        angleDegrees,
      )

      const rotation = calculateLabelRotation(angleDegrees)
      const textAnchor = getTextAnchor(angleDegrees)
      const alignmentBaseline = getAlignmentBaseline(angleDegrees)

      // Adaptive font size based on number of labels
      const fontSize = labels.length > 8 ? "10" : labels.length > 6 ? "11" : "12"

      // Highlight min and max values
      const isMinOrMax = index === 0 || index === labels.length - 1
      const fontWeight = isMinOrMax ? "bold" : "normal"
      const fillColor = isMinOrMax ? "#333" : "#555"

      elements.push(
        <SvgText
          key={`label-${index}`}
          x={labelPosition.x}
          y={labelPosition.y + 5}
          fontSize={fontSize}
          fontWeight={fontWeight}
          fill={fillColor}
          textAnchor={textAnchor}
          alignmentBaseline={alignmentBaseline}
          transform={`rotate(${rotation} ${labelPosition.x} ${labelPosition.y})`}
        >
          {labelValue}
        </SvgText>,
      )
    })

    return elements
  }, [geometry, tickLabels, min, max])

  const centerValue = clampedValue

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size + 10} ${size + 10}`}>
        {/* Background */}
        <Path d={backgroundPath} fill="none" stroke="#e0e0e0" strokeWidth={arcWidth} />

        {/* Colored segments */}
        {segmentPaths}

        {/* Ticks & labels */}
        {ticksAndLabels}

        {/* Needle */}
        <AnimatedPath
          animatedProps={needleAnimatedProps}
          stroke="#222"
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Hub */}
        <Circle cx={geometry.centerX} cy={geometry.centerY} r={HUB_RADIUS} fill="#222" />
      </Svg>

      <View style={styles.centerText}>
        <Text style={styles.value}>{centerValue}</Text>
        <Text style={styles.unit}>°C</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  centerText: {
    margin: 10,
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  container: { position: "relative" },
  unit: { color: "#666666", fontSize: 14, marginTop: 10 },
  value: { color: "#333333", fontSize: 36, fontWeight: "bold" },
})
