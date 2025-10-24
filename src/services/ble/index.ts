import { Platform } from "react-native"
import { Buffer } from "buffer"
import { BleManager, Device, Subscription } from "react-native-ble-plx"

import EventBus from "@/services/event-bus"

import { requestPermissions } from "./permissions"

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
const TEMP_CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8"
const COMMAND_CHAR_UUID = "1a7e8e50-9d0d-457e-97f6-68f447781f8f"

const base64ToFloat = (base64: string) => Buffer.from(base64, "base64").readFloatLE(0)

class BLEService {
  private static instance: BLEService | null = null
  private manager: BleManager
  private device: Device | null = null
  private tempSubscription: Subscription | null = null
  private currentTemp: number | null = null
  private isScanning = false
  private isConnected = false

  private constructor() {
    this.manager = new BleManager({ restoreStateIdentifier: "BLEStateRestore" })
  }

  public static getInstance(): BLEService {
    if (!BLEService.instance) BLEService.instance = new BLEService()
    return BLEService.instance
  }

  public async scanAndConnect() {
    const hasPerm = await requestPermissions()
    if (!hasPerm) return EventBus.emit("bleError", { message: "Permissions not granted" })

    if (this.device)
      return EventBus.emit("bleStatus", {
        status: "connected",
        device: this.device.name || undefined,
      })

    if (this.isScanning) return
    this.isScanning = true
    EventBus.emit("bleStatus", { status: "scanning" })

    this.manager.startDeviceScan(null, { allowDuplicates: true }, async (err, dev) => {
      if (err) {
        this.isScanning = false
        return EventBus.emit("bleError", { message: err.message })
      }
      if (dev?.name === "ESP32_TEMP_SERVER") {
        this.manager.stopDeviceScan()
        this.isScanning = false
        await this.connectToDevice(dev)
      }
    })

    if (Platform.OS === "ios")
      setTimeout(() => {
        if (this.isScanning) {
          this.manager.stopDeviceScan()
          this.isScanning = false
          EventBus.emit("bleStatus", { status: "timeout" })
        }
      }, 10000)
  }

  private async connectToDevice(device: Device) {
    try {
      this.device = await device.connect()
      await this.device.discoverAllServicesAndCharacteristics()
      this.isConnected = true
      await this.setupNotifications()
      EventBus.emit("bleStatus", { status: "connected", device: device.name || undefined })

      this.manager.onDeviceDisconnected(device.id, () => {
        this.isConnected = false
        this.device = null
        this.tempSubscription?.remove()
        EventBus.emit("bleStatus", { status: "disconnected", device: device.name || undefined })
        EventBus.emit("bleStatus", { status: "reconnecting" })
        // Attempt to reconnect after a short delay
        setTimeout(() => this.scanAndConnect(), 2000)
      })
    } catch (err: any) {
      EventBus.emit("bleError", { message: err.message })
    }
  }

  private async setupNotifications() {
    if (!this.device) return
    this.tempSubscription = this.device.monitorCharacteristicForService(
      SERVICE_UUID,
      TEMP_CHAR_UUID,
      (err, char) => {
        if (!this.isConnected) return // Ignore callbacks after disconnection
        if (err) return EventBus.emit("bleError", { message: err.message })
        if (char?.value) {
          try {
            const temp = base64ToFloat(char.value)
            this.currentTemp = temp
            EventBus.emit("tempUpdate", temp)
          } catch {
            EventBus.emit("bleError", { message: "Invalid temperature data received" })
          }
        }
      },
    )
  }

  public async sendCommand(cmd: string, value: any) {
    if (!this.device) return EventBus.emit("bleError", { message: "Not connected" })
    const payload = Buffer.from(JSON.stringify({ cmd, value })).toString("base64")
    try {
      await this.device.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        COMMAND_CHAR_UUID,
        payload,
      )
      EventBus.emit("commandSent", { cmd, value })
    } catch (err: any) {
      EventBus.emit("bleError", { message: err.message })
    }
  }

  public getCurrentTemp() {
    return this.currentTemp
  }
}

export default BLEService.getInstance()
