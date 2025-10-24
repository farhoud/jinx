type StepType = "TARGET_TEMPERATURE" | "TEMPERATURE_MAINTENANCE"

interface BaseStep {
  stepId: string
  type: StepType
  durationMinutes: number
  events: Event[]
}

interface TemperatureTargetStep extends BaseStep {
  type: "TARGET_TEMPERATURE"
  name: string
  direction: "HEATING" | "COOLING" | "BOILING"
  targetTemperatureC: number
}

interface TemperatureMaintenanceStep extends BaseStep {
  type: "TEMPERATURE_MAINTENANCE"
  name: string
  tempBoundaryHighC: number
  tempBoundaryLowC: number
}

type Step = TemperatureTargetStep | TemperatureMaintenanceStep

type TriggerType = "TEMPERATURE_TARGET" | "TIME_INTERVAL" | "BOUNDARY_VIOLATION" | "TIME_ELAPSED"

interface BaseTrigger {
  type: TriggerType
}

interface TemperatureTrigger extends BaseTrigger {
  type: "TEMPERATURE_TARGET"
  condition: "REACHED_OR_EXCEEDED" | "REACHED_OR_BELOW"
  valueC: number
}

interface TimeIntervalTrigger extends BaseTrigger {
  type: "TIME_INTERVAL"
  intervalMinutes: number
  repeatTimes?: number
  startOffsetMinutes?: number
}

interface BoundaryTrigger extends BaseTrigger {
  type: "BOUNDARY_VIOLATION"
  condition: "ABOVE_HIGH" | "BELOW_LOW"
  valueC: number
}

interface TimeElapsedTrigger extends BaseTrigger {
  type: "TIME_ELAPSED"
  valueMinutes: number
}

type Trigger = TemperatureTrigger | TimeIntervalTrigger | BoundaryTrigger | TimeElapsedTrigger

type NotificationType = "CRITICAL_DIALOG" | "SOFT_REMINDER"

interface BaseNotification {
  type: NotificationType
  message: string
}

interface CriticalDialog extends BaseNotification {
  type: "CRITICAL_DIALOG"
  actionButtonText: string
}

interface SoftReminder extends BaseNotification {
  type: "SOFT_REMINDER"
}

type Notification = CriticalDialog | SoftReminder

interface Event {
  eventId: string
  trigger: Trigger
  notification: Notification
}

interface Recipe {
  recipeId: string
  name: string
  description: string
  createdAt: string
  steps: Step[]
}

export type {
  Recipe,
  Step,
  BaseStep,
  TemperatureTargetStep,
  TemperatureMaintenanceStep,
  Event,
  Trigger,
  TemperatureTrigger,
  TimeIntervalTrigger,
  BoundaryTrigger,
  TimeElapsedTrigger,
  Notification,
  CriticalDialog,
  SoftReminder,
  StepType,
  TriggerType,
  NotificationType,
}
