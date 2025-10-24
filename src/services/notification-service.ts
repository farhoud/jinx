import * as Notifications from "expo-notifications"

import EventBus from "@/services/event-bus"

const NOTIFICATION_ID = "ble-status"

class NotificationService {
  private static instance: NotificationService | null = null

  private constructor() {
    this.register()
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) NotificationService.instance = new NotificationService()
    return NotificationService.instance
  }

  private async show(title: string, body: string) {
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_ID,
        content: { title, body, sound: false },
        trigger: null,
      })
    } catch (err) {
      console.error("Notification error", err)
    }
  }

  private register() {
    EventBus.on("bleStatus", async ({ status, device }) => {
      const msgs: Record<string, string> = {
        scanning: "Searching for ESP32...",
        connected: `Connected to ${device || "device"}`,
        disconnected: "BLE disconnected.",
        timeout: "BLE scan timed out.",
      }
      if (msgs[status]) await this.show("BLE Status", msgs[status])
    })

    EventBus.on(
      "tempSmoothed",
      async ({ smoothed }) => await this.show("Temperature", `${smoothed.toFixed(1)}°C`),
    )

    EventBus.on("bleError", async ({ message }) => await this.show("BLE Error", message))
    EventBus.on(
      "commandSent",
      async ({ cmd, value }) => await this.show("Command Sent", `${cmd}: ${value}`),
    )
  }
}

export default NotificationService.getInstance()
