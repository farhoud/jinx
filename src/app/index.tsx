import "@/services/notification-service"
import "@/services/temperature-processor"
import { RecipeProvider } from "@/context/RecipeContext"
import BrewingScreen from "@/screens/BrewingScreen"

export default function App() {
  return (
    <RecipeProvider>
      <BrewingScreen />
    </RecipeProvider>
  )
}
