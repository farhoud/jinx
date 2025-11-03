import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react"
import { Platform } from "react-native"
import { Buffer } from "buffer"
import { BleManager, Device, Subscription } from "react-native-ble-plx"

import { requestPermissions } from "@/utils/permissions" // Assuming this path is correct

// --- Constants ---
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
const TEMP_CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8"
const COMMAND_CHAR_UUID = "1a7e8e50-9d0d-457e-97f6-68f447781f8f"
const TARGET_DEVICE_NAME = "ESP32_TEMP_SERVER"
const SCAN_TIMEOUT_MS = 10000

// --- Utility Function ---
const base64ToFloat = (base64: string) => Buffer.from(base64, "base64").readFloatLE(0)

// --- Domain Types ---
export type DeviceConnectionStatus =
  | "idle"
  | "scanning"
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "timeout"
  | "error"

interface TemperatureDeviceState {
  status: DeviceConnectionStatus
  error: string | null
  temperatureReading: number | null // Renamed
  connectedDevice: Device | null // Renamed
  deviceName: string | undefined
}

interface TemperatureDeviceContext extends TemperatureDeviceState {
  scanAndConnectToDevice: () => Promise<void> // Renamed
  sendControlCommand: (command: string, controlValue: any) => Promise<void> // Renamed
}

// --- Context Setup ---
const initialTemperatureDeviceState: TemperatureDeviceState = {
  // Renamed
  status: "idle",
  error: null,
  temperatureReading: null, // Renamed
  connectedDevice: null, // Renamed
  deviceName: undefined,
}

const TemperatureDeviceContext = createContext<TemperatureDeviceContext | undefined>(undefined) // Renamed

// --- Provider Component ---
export const TemperatureDeviceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Renamed
  const [state, setState] = useState<TemperatureDeviceState>(initialTemperatureDeviceState) // Renamed
  const managerRef = useRef(new BleManager({ restoreStateIdentifier: "BLEStateRestore" }))
  const tempSubscriptionRef = useRef<Subscription | null>(null)
  const isScanningRef = useRef(false)
  const isConnectedRef = useRef(false)

  // Function to update state and log status changes
  const updateState = useCallback((updates: Partial<TemperatureDeviceState>) => {
    // Using TemperatureDeviceState
    setState((prevState) => ({ ...prevState, ...updates }))
  }, [])

  // Disconnection handler
  const handleDeviceDisconnected = useCallback(() => {
    isConnectedRef.current = false
    tempSubscriptionRef.current?.remove()
    tempSubscriptionRef.current = null

    updateState({
      status: "disconnected",
      connectedDevice: null, // Renamed
      deviceName: undefined,
    })

    // Attempt to reconnect after a short delay
    updateState({ status: "reconnecting" })
    setTimeout(() => scanAndConnectToDevice(), 2000) // Renamed
  }, [updateState])

  // Notification setup
  const setupNotifications = useCallback(
    async (device: Device) => {
      tempSubscriptionRef.current = device.monitorCharacteristicForService(
        SERVICE_UUID,
        TEMP_CHAR_UUID,
        (err, char) => {
          if (!isConnectedRef.current) return
          if (err) {
            return updateState({ status: "error", error: err.message })
          }
          if (char?.value) {
            try {
              const temp = base64ToFloat(char.value)
              updateState({ temperatureReading: temp, error: null }) // Renamed
            } catch {
              updateState({ status: "error", error: "Invalid temperature data received" })
            }
          }
        },
      )
    },
    [updateState],
  )

  // Connection logic
  const connectToDevice = useCallback(
    async (device: Device) => {
      updateState({
        status: "connecting",
        connectedDevice: device,
        deviceName: device.name || "Unknown Device",
      }) // Renamed
      try {
        const connectedDevice = await device.connect()
        await connectedDevice.discoverAllServicesAndCharacteristics()
        isConnectedRef.current = true
        updateState({ status: "connected", error: null, connectedDevice }) // Renamed
        await setupNotifications(connectedDevice)

        // Set up disconnection listener
        managerRef.current.onDeviceDisconnected(connectedDevice.id, () =>
          handleDeviceDisconnected(),
        )
      } catch (err: any) {
        isConnectedRef.current = false
        updateState({ status: "error", error: err.message })
      }
    },
    [updateState, setupNotifications, handleDeviceDisconnected],
  )

  // Scanning logic
  const scanAndConnectToDevice = useCallback(async () => {
    // Renamed
    const manager = managerRef.current
    const hasPerm = await requestPermissions()

    if (!hasPerm) {
      return updateState({ status: "error", error: "Permissions not granted" })
    }

    if (isConnectedRef.current) {
      return updateState({ status: "connected" })
    }

    if (isScanningRef.current) return
    isScanningRef.current = true
    updateState({ status: "scanning", error: null })

    manager.startDeviceScan(null, { allowDuplicates: true }, async (err, dev) => {
      if (err) {
        manager.stopDeviceScan()
        isScanningRef.current = false
        return updateState({ status: "error", error: err.message })
      }

      if (dev?.name === TARGET_DEVICE_NAME) {
        manager.stopDeviceScan()
        isScanningRef.current = false
        await connectToDevice(dev)
      }
    })

    // Timeout for iOS (or general) scanning
    if (Platform.OS === "ios") {
      setTimeout(() => {
        if (isScanningRef.current) {
          manager.stopDeviceScan()
          isScanningRef.current = false
          updateState({ status: "timeout", error: "BLE scan timed out." })
        }
      }, SCAN_TIMEOUT_MS)
    }
  }, [updateState, connectToDevice])

  // Command sending logic
  const sendControlCommand = useCallback(
    // Renamed
    async (command: string, controlValue: any) => {
      // Renamed parameters
      const { connectedDevice } = state // Renamed
      if (!connectedDevice) {
        return updateState({ status: "error", error: "Not connected, cannot send command." })
      }

      // Using command and controlValue to create payload
      const payload = Buffer.from(JSON.stringify({ cmd: command, value: controlValue })).toString(
        "base64",
      )
      try {
        await connectedDevice.writeCharacteristicWithResponseForService(
          SERVICE_UUID,
          COMMAND_CHAR_UUID,
          payload,
        )
      } catch (err: any) {
        updateState({ status: "error", error: err.message })
      }
    },
    [state.connectedDevice, updateState], // Renamed
  )

  // Clean up on unmount
  useEffect(() => {
    scanAndConnectToDevice()
    return () => {
      managerRef.current.destroy()
      tempSubscriptionRef.current?.remove()
    }
  }, [])

  const contextValue: TemperatureDeviceContext = {
    // Renamed
    ...state,
    scanAndConnectToDevice, // Renamed
    sendControlCommand, // Renamed
  }

  return (
    <TemperatureDeviceContext.Provider value={contextValue}>
      {children}
    </TemperatureDeviceContext.Provider>
  ) // Renamed
}

// --- Hook to use the context ---
export const useTemperatureDevice = () => {
  // Renamed
  const context = useContext(TemperatureDeviceContext) // Renamed
  if (context === undefined) {
    throw new Error("useTemperatureDevice must be used within a TemperatureDeviceProvider") // Renamed
  }
  return context
}
