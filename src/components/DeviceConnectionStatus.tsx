import { StyleProp, View, ViewStyle } from "react-native"

import { useTemperatureDevice } from "@/context/TemperatureDeviceContext"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"

import { Icon } from "./Icon"
import { Text } from "./Text"

interface DeviceConnectionStatusProps {
  /**
   * Optional style override for the container.
   */
  style?: StyleProp<ViewStyle>
  /**
   * Whether to show the status text alongside the icon.
   */
  showText?: boolean
  /**
   * Size of the icon.
   */
  iconSize?: number
}

/**
 * Component to display the current device connection status with an icon.
 * @param {DeviceConnectionStatusProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
export function DeviceConnectionStatus({
  style,
  showText = true,
  iconSize = 24,
}: DeviceConnectionStatusProps) {
  const { status, deviceName } = useTemperatureDevice()
  const { themed, theme } = useAppTheme()

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "idle":
        return {
          icon: "WifiOff",
          colorKey: "textDim" as const,
          text: "Disconnected",
        }
      case "scanning":
        return {
          icon: "Search",
          colorKey: "text" as const,
          text: "Scanning...",
        }
      case "connecting":
        return {
          icon: "Loader",
          colorKey: "text" as const,
          text: "Connecting...",
        }
      case "connected":
        return {
          icon: "Wifi",
          colorKey: "tint" as const,
          text: `Connected${deviceName ? ` to ${deviceName}` : ""}`,
        }
      case "disconnected":
        return {
          icon: "WifiOff",
          colorKey: "error" as const,
          text: "Disconnected",
        }
      case "reconnecting":
        return {
          icon: "RefreshCw",
          colorKey: "text" as const,
          text: "Reconnecting...",
        }
      case "timeout":
        return {
          icon: "ClockX",
          colorKey: "error" as const,
          text: "Connection Timeout",
        }
      case "error":
        return {
          icon: "AlertTriangle",
          colorKey: "error" as const,
          text: "Connection Error",
        }
      default:
        return {
          icon: "HelpCircle",
          colorKey: "textDim" as const,
          text: "Unknown",
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <View style={themed([$container, style])}>
      <Icon lucideIcon={config.icon} size={iconSize} color={theme.colors[config.colorKey]} />
      {showText && (
        <Text
          text={config.text}
          size="sm"
          style={themed(() => ({ color: theme.colors[config.colorKey], marginLeft: 8 }))}
        />
      )}
    </View>
  )
}

const $container: ViewStyle = {
  ...$styles.row,
  alignItems: "center",
}
