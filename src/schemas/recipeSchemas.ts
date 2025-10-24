import { z } from "zod"

export const triggerTypeSchema = z.enum([
  "TEMPERATURE_TARGET",
  "TIME_INTERVAL",
  "BOUNDARY_VIOLATION",
  "TIME_ELAPSED",
])

export const stepTypeSchema = z.enum(["TARGET_TEMPERATURE", "TEMPERATURE_MAINTENANCE"])

export const notificationTypeSchema = z.enum(["CRITICAL_DIALOG", "SOFT_REMINDER"])

export const directionSchema = z.enum(["HEATING", "COOLING"])

export const conditionSchema = z.enum([
  "REACHED_OR_EXCEEDED",
  "REACHED_OR_BELOW",
  "ABOVE_HIGH",
  "BELOW_LOW",
])

export const temperatureTriggerSchema = z.object({
  type: z.literal("TEMPERATURE_TARGET"),
  condition: z.enum(["REACHED_OR_EXCEEDED", "REACHED_OR_BELOW"]),
  valueC: z.number().min(-50).max(150),
})

export const timeIntervalTriggerSchema = z.object({
  type: z.literal("TIME_INTERVAL"),
  intervalMinutes: z.number().min(1).max(1440),
  repeatTimes: z.number().min(1).max(100).optional(),
  startOffsetMinutes: z.number().min(0).max(1440).optional(),
})

export const boundaryTriggerSchema = z.object({
  type: z.literal("BOUNDARY_VIOLATION"),
  condition: z.enum(["ABOVE_HIGH", "BELOW_LOW"]),
  valueC: z.number().min(-50).max(150),
})

export const timeElapsedTriggerSchema = z.object({
  type: z.literal("TIME_ELAPSED"),
  valueMinutes: z.number().min(0).max(1440),
})

export const triggerSchema = z.discriminatedUnion("type", [
  temperatureTriggerSchema,
  timeIntervalTriggerSchema,
  boundaryTriggerSchema,
  timeElapsedTriggerSchema,
])

export const notificationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("CRITICAL_DIALOG"),
    message: z.string().min(1).max(200),
  }),
  z.object({
    type: z.literal("SOFT_REMINDER"),
    message: z.string().min(1).max(200),
  }),
])

export const eventSchema = z.object({
  eventId: z.string().min(1).max(50),
  trigger: triggerSchema,
  notification: notificationSchema,
})

export const targetTemperatureStepSchema = z.object({
  stepId: z.string().min(1).max(50),
  type: z.literal("TARGET_TEMPERATURE"),
  name: z.string().min(1).max(100),
  direction: directionSchema,
  targetTemperatureC: z.number().min(-50).max(150),
  durationMinutes: z.number().min(0).max(1440),
  events: z.array(eventSchema).max(10),
})

export const temperatureMaintenanceStepSchema = z
  .object({
    stepId: z.string().min(1).max(50),
    type: z.literal("TEMPERATURE_MAINTENANCE"),
    name: z.string().min(1).max(100),
    tempBoundaryLowC: z.number().min(-50).max(150),
    tempBoundaryHighC: z.number().min(-50).max(150),
    durationMinutes: z.number().min(0).max(1440),
    events: z.array(eventSchema).max(10),
  })
  .refine((data) => data.tempBoundaryLowC < data.tempBoundaryHighC, {
    message: "Low boundary must be less than high boundary",
    path: ["tempBoundaryLowC"],
  })

export const stepSchema = z.discriminatedUnion("type", [
  targetTemperatureStepSchema,
  temperatureMaintenanceStepSchema,
])

export const recipeSchema = z.object({
  recipeId: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  createdAt: z.string().datetime(),
  steps: z.array(stepSchema).min(1).max(20),
})
