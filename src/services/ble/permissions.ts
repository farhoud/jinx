import { PermissionsAndroid, Platform } from "react-native"
import * as Device from "expo-device"

const requestAndroid31Permissions = async () => {
  const bluetoothScanPermission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    {
      title: "Location Permission",
      message: "Bluetooth Low Energy requires Location",
      buttonPositive: "OK",
    },
  )
  const bluetoothConnectPermission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    {
      title: "Location Permission",
      message: "Bluetooth Low Energy requires Location",
      buttonPositive: "OK",
    },
  )
  const fineLocationPermission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: "Location Permission",
      message: "Bluetooth Low Energy requires Location",
      buttonPositive: "OK",
    },
  )

  const notificationPermission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    {
      title: "Notification Permission",
      message: "This app needs to show notifications for temperature updates.",
      buttonPositive: "OK",
    },
  )

  return (
    bluetoothScanPermission === "granted" &&
    bluetoothConnectPermission === "granted" &&
    fineLocationPermission === "granted" &&
    notificationPermission === "granted"
  )
}

export const requestPermissions = async () => {
  if (Platform.OS === "android") {
    if ((Device.platformApiLevel ?? -1) < 31) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "Bluetooth Low Energy requires Location",
          buttonPositive: "OK",
        },
      )
      return granted === PermissionsAndroid.RESULTS.GRANTED
    } else {
      const isAndroid31PermissionsGranted = await requestAndroid31Permissions()

      return isAndroid31PermissionsGranted
    }
  } else {
    return true
  }
}
