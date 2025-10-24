class TemperatureMonitor {
  alphaTemp: number
  alphaRate: number
  lastTempSmooth: number | null
  lastRateSmooth: number
  lastTime: number | null
  constructor(alphaTemp = 0.2, alphaRate = 0.3) {
    this.alphaTemp = alphaTemp
    this.alphaRate = alphaRate

    this.lastTempSmooth = null
    this.lastRateSmooth = 0
    this.lastTime = null
  }

  push(tempC: number, timeMs: number) {
    if (this.lastTempSmooth === null) {
      this.lastTempSmooth = tempC
      return { smoothed: tempC, ratePerSecond: 0, ratePerMinute: 0 }
    }
    if (this.lastTime === null) {
      this.lastTime = timeMs
    }
    const dt = (timeMs - this.lastTime) / 1000 // seconds
    if (dt <= 0) return { smoothed: this.lastTempSmooth, ratePerSecond: 0, ratePerMinute: 0 }

    // --- 1. Smooth the temperature ---
    const newTempSmooth = this.alphaTemp * tempC + (1 - this.alphaTemp) * this.lastTempSmooth

    // --- 2. Compute raw rate ---
    const rawRate = (newTempSmooth - this.lastTempSmooth) / dt

    // --- 3. Smooth the rate ---
    const newRateSmooth = this.alphaRate * rawRate + (1 - this.alphaRate) * this.lastRateSmooth

    this.lastTempSmooth = newTempSmooth
    this.lastRateSmooth = newRateSmooth
    this.lastTime = timeMs

    return {
      smoothed: newTempSmooth,
      ratePerSecond: newRateSmooth,
      ratePerMinute: newRateSmooth * 60,
    }
  }
}

export default new TemperatureMonitor(0.5)
