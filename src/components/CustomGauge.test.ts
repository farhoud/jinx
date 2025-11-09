// Test file to verify CustomGauge scaling functionality
// This would be run in a test environment

import { scaleToGaugeRange, generateTickLabels } from "./CustomGauge"

// Test scaleToGaugeRange function
console.log("Testing scaleToGaugeRange:")
console.log("0-100 range (default):", scaleToGaugeRange(20, 0, 100)) // Should be 20
console.log("0-120 range:", scaleToGaugeRange(24, 0, 120)) // Should be 20
console.log("-20 to 80 range:", scaleToGaugeRange(30, -20, 80)) // Should be 50
console.log("Clamping test (over max):", scaleToGaugeRange(150, 0, 100)) // Should be 100
console.log("Clamping test (under min):", scaleToGaugeRange(-10, 0, 100)) // Should be 0

// Test generateTickLabels function
console.log("\nTesting generateTickLabels:")
console.log("0-100 range:", generateTickLabels(0, 100)) // [0, 20, 40, 60, 80, 100]
console.log("0-120 range:", generateTickLabels(0, 120)) // [0, 24, 48, 72, 96, 120]
console.log("-20 to 80 range:", generateTickLabels(-20, 80)) // [-20, 0, 20, 40, 60, 80]

// Test edge cases
console.log("\nTesting edge cases:")
console.log("Zero range:", scaleToGaugeRange(50, 50, 50)) // Should be 0
