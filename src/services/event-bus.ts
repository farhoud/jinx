import mitt from "mitt"

export type Events = {
  tempUpdate: number
  tempSmoothed: { smoothed: number; ratePerSecond: number; ratePerMinute: number }
  bleStatus: { status: "scanning" | "connected" | "disconnected" | "timeout"; device?: string }
  bleError: { message: string }
  commandSent: { cmd: string; value: any }
  recipeEvent: { type: "critical" | "reminder"; message: string; actionText?: string }
}

const EventBus = mitt<Events>()

export default EventBus
