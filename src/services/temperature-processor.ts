import TemperatureMonitor from "@/libs/temperatur-monitor"
import EventBus from "@/services/event-bus"

EventBus.on("tempUpdate", (rawTemp) => {
  const time = Date.now()
  const { smoothed, ratePerSecond, ratePerMinute } = TemperatureMonitor.push(rawTemp, time)
  EventBus.emit("tempSmoothed", { smoothed, ratePerSecond, ratePerMinute })
})
