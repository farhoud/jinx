import { useState, useRef, useMemo } from "react"

// Define the properties passed to the hook
interface MonitorOptions {
  alphaTemp?: number
  alphaRate?: number
}

/**
 * A custom hook to monitor, smooth, and calculate the rate of change of temperature readings.
 * Now manages the smoothed data as individual state variables.
 */
const useTemperatureMonitor = (options: MonitorOptions = {}) => {
  const { alphaTemp = 0.2, alphaRate = 0.3 } = options

  // --- 1. Individual State for the Output Data ---
  // These states will trigger a re-render when the push function updates them.
  const [smoothed, setSmoothed] = useState<number>(0)
  const [ratePerSecond, setRatePerSecond] = useState<number>(0)
  const [ratePerMinute, setRatePerMinute] = useState<number>(0)

  // --- 2. Ref for Internal, Non-Rendering State (Remains the same) ---
  const stateRef = useRef<{
    lastTempSmooth: number | null
    lastRateSmooth: number
    lastTime: number | null
    lastTempRaw: number | null
  }>({
    lastTempSmooth: null,
    lastRateSmooth: 0,
    lastTime: null,
    lastTempRaw: null,
  })

  // --- 3. The Push Function (Core Logic) ---
  const push = useMemo(
    () => (tempC: number, timeMs: number) => {
      const state = stateRef.current

      // --- A. Initialization (First Call) ---
      if (state.lastTempSmooth === null) {
        state.lastTempSmooth = tempC
        state.lastTempRaw = tempC
        state.lastTime = timeMs

        // Update individual states
        setSmoothed(tempC)
        setRatePerSecond(0)
        setRatePerMinute(0)
        return
      }

      // Handle time difference (dt)
      if (state.lastTime === null) {
        state.lastTime = timeMs
      }
      const dt = (timeMs - state.lastTime) / 1000 // seconds

      if (dt <= 0) {
        return
      }

      // --- B. Calculations ---
      const newTempSmooth = alphaTemp * tempC + (1 - alphaTemp) * state.lastTempSmooth
      const rawRate = (tempC - state.lastTempRaw!) / dt
      const newRateSmooth = alphaRate * rawRate + (1 - alphaRate) * state.lastRateSmooth
      const ratePerMin = newRateSmooth * 60

      // --- C. Update StateRef and Output State ---
      state.lastTempSmooth = newTempSmooth
      state.lastRateSmooth = newRateSmooth
      state.lastTempRaw = tempC
      state.lastTime = timeMs

      // Update individual states (which trigger re-render)
      setSmoothed(newTempSmooth)
      setRatePerSecond(newRateSmooth)
      setRatePerMinute(ratePerMin)
    },
    [alphaTemp, alphaRate],
  )

  // Return the individual values and the push function
  return {
    smoothed,
    ratePerSecond,
    ratePerMinute,
    push,
  }
}

export default useTemperatureMonitor
