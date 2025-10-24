import { useState, useEffect } from "react"
import { AppState } from "react-native"

import BLEService from "@/services/ble"
import EventBus from "@/services/event-bus"

export const useBLE = () => {
  const [temperature, setTemperature] = useState<number | null>(null)
  const [ratePerMinute, setRatePerMinute] = useState<number>(0)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const handleTemp = ({ smoothed, ratePerMinute }: any) => {
      setTemperature(smoothed)
      setRatePerMinute(ratePerMinute)
    }
    const handleStatus = ({ status }: any) => setIsConnected(status === "connected")

    EventBus.on("tempSmoothed", handleTemp)
    EventBus.on("bleStatus", handleStatus)

    const appStateSub = AppState.addEventListener("change", async (next) => {
      if (next === "active" || next === "background") await BLEService.scanAndConnect()
    })

    BLEService.scanAndConnect()

    return () => {
      EventBus.off("tempSmoothed", handleTemp)
      EventBus.off("bleStatus", handleStatus)
      appStateSub.remove()
    }
  }, [])

  const sendCommand = async (cmd: string, value: any) => await BLEService.sendCommand(cmd, value)

  return { temperature, ratePerMinute, isConnected, sendCommand }
}
