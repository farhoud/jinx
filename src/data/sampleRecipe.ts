import { Recipe } from "@/types/recipeTypes"

export const sampleRecipe: Recipe = {
  recipeId: "REC_BREW_PALE_ALE_V1",
  name: "Pale Ale Mash & Boil",
  description: "A standard three-vessel pale ale process.",
  createdAt: "2025-10-23T12:00:00Z",
  steps: [
    // Step 1: Heating Water
    {
      stepId: "STEP_HEAT_WATER",
      name: "Heating Water",
      type: "TARGET_TEMPERATURE",
      direction: "HEATING",
      targetTemperatureC: 70.0,
      durationMinutes: 0,
      events: [
        {
          eventId: "EVT_PUT_BREWING_BACK",
          trigger: {
            type: "TIME_ELAPSED",
            valueMinutes: 0,
          },
          notification: {
            type: "SOFT_REMINDER",
            message: "Put the brewing bag in",
          },
        },
        {
          eventId: "EVT_TARGET_REACHED",
          trigger: {
            type: "TEMPERATURE_TARGET",
            condition: "REACHED_OR_EXCEEDED",
            valueC: 70.0,
          },
          notification: {
            type: "SOFT_REMINDER",
            message: "Target temperature reached! Add Grain.",
          },
        },
      ],
    },
    // Step 2: Mashing
    {
      stepId: "STEP_MASHING",
      name: "Mashing",
      type: "TEMPERATURE_MAINTENANCE",
      tempBoundaryLowC: 65.5,
      tempBoundaryHighC: 68.5,
      durationMinutes: 70,
      events: [
        {
          eventId: "EVT_WATER_SUPPLIMENT",
          trigger: {
            type: "TIME_ELAPSED",
            valueMinutes: 1,
          },
          notification: {
            type: "SOFT_REMINDER",
            message: "Controll PH and add water suppliments",
          },
        },
        {
          eventId: "EVT_ADD_ENZYME",
          trigger: {
            type: "TIME_ELAPSED",
            valueMinutes: 5,
          },
          notification: {
            type: "SOFT_REMINDER",
            message: "Controll PH and add water suppliments",
          },
        },
        {
          eventId: "EVT_STIR_10MIN_START",
          trigger: {
            type: "TIME_INTERVAL",
            intervalMinutes: 10,
            repeatTimes: 3, // Repeat 3 times (at 10, 20, 30 min)
          },
          notification: {
            type: "SOFT_REMINDER",
            message: "Stir the mash now.",
          },
        },
        {
          eventId: "EVT_STIR_20MIN_LATER",
          trigger: {
            type: "TIME_INTERVAL",
            intervalMinutes: 20,
            startOffsetMinutes: 30, // Start after the first 30 min
          },
          notification: {
            type: "SOFT_REMINDER",
            message: "Stir the mash (longer interval).",
          },
        },
        {
          eventId: "EVT_TEMP_BOUNDARY_HIGH",
          trigger: {
            type: "BOUNDARY_VIOLATION",
            condition: "ABOVE_HIGH",
            valueC: 68.5,
          },
          notification: {
            type: "CRITICAL_DIALOG",
            message: "Temperature too high! Reduce heat.",
          },
        },
        {
          eventId: "EVT_TEMP_BOUNDARY_LOW",
          trigger: {
            type: "BOUNDARY_VIOLATION",
            condition: "BELOW_LOW",
            valueC: 65.5,
          },
          notification: {
            type: "CRITICAL_DIALOG",
            message: "Temperature too low! Increase heat.",
          },
        },
        {
          eventId: "EVT_MASH_END",
          trigger: {
            type: "TIME_ELAPSED",
            valueMinutes: 70,
          },
          notification: {
            type: "SOFT_REMINDER",
            message: "Mash complete. Prepare for Boil.",
          },
        },
      ],
    },
    // Step 3: Boiling
    {
      stepId: "STEP_REACH_BOILING",
      name: "Boil it",
      type: "TARGET_TEMPERATURE",
      direction: "HEATING",
      targetTemperatureC: 100.0,
      durationMinutes: 0,
      events: [
        {
          eventId: "EVT_BOIL_START_CONFIRM",
          trigger: {
            type: "TEMPERATURE_TARGET",
            condition: "REACHED_OR_EXCEEDED",
            valueC: 100,
          },
          notification: {
            type: "SOFT_REMINDER",
            message: "Boil has started. Begin 60-minute timer.",
          },
        },
      ],
    },
    {
      stepId: "STEP_BOILING",
      name: "Boiling",
      type: "TEMPERATURE_MAINTENANCE",
      tempBoundaryLowC: 95,
      tempBoundaryHighC: 105,
      durationMinutes: 60,
      events: [
        {
          eventId: "EVT_HOPS_60MIN",
          trigger: {
            type: "TIME_ELAPSED",
            valueMinutes: 0,
          },
          notification: {
            type: "SOFT_REMINDER",
            message: "Time for Bittering Hops!",
          },
        },
        {
          eventId: "EVT_BOIL_END",
          trigger: {
            type: "TIME_ELAPSED",
            valueMinutes: 60,
          },
          notification: {
            type: "CRITICAL_DIALOG",
            message: "Boil complete. Begin cooling.",
          },
        },
      ],
    },
    // Step 4: Cooling
    {
      stepId: "STEP_COOLING",
      name: "Cooling",
      type: "TARGET_TEMPERATURE",
      direction: "COOLING",
      targetTemperatureC: 25.0,
      durationMinutes: 0,
      events: [
        {
          eventId: "EVT_COOLING_COMPLETE",
          trigger: {
            type: "TEMPERATURE_TARGET",
            condition: "REACHED_OR_BELOW",
            valueC: 25.0,
          },
          notification: {
            type: "SOFT_REMINDER",
            message: "Final temperature reached. Process complete!",
          },
        },
      ],
    },
  ],
}
