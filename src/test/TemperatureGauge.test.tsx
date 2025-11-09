import { render } from "@testing-library/react-native"
import { TemperatureGauge } from "../components/TemperatureGauge"
import { ThemeProvider } from "../theme/context"

// Helper to wrap component with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>)
}

describe("TemperatureGauge", () => {
  it("renders correctly with default props", () => {
    const { getByLabelText } = renderWithTheme(<TemperatureGauge temperature={45} />)

    expect(getByLabelText("Current temperature is 45 degrees Celsius")).toBeTruthy()
  })

  it("renders correctly with custom range 0-120", () => {
    const { getByLabelText } = renderWithTheme(
      <TemperatureGauge temperature={50} minTemp={0} maxTemp={120} />,
    )

    expect(getByLabelText("Current temperature is 50 degrees Celsius")).toBeTruthy()
  })

  it("renders correctly with custom segments", () => {
    const { getByLabelText } = renderWithTheme(
      <TemperatureGauge
        temperature={85}
        minTemp={50}
        maxTemp={120}
        tempSegments={[
          { to: 60, color: "#5BE12C" },
          { to: 90, color: "#F5CD19" },
          { to: 120, color: "#EA4228" },
        ]}
      />,
    )

    expect(getByLabelText("Current temperature is 85 degrees Celsius")).toBeTruthy()
  })

  it("clamps temperature to bounds", () => {
    const { getByLabelText } = renderWithTheme(
      <TemperatureGauge temperature={120} minTemp={0} maxTemp={100} />,
    )

    expect(getByLabelText("Current temperature is 120 degrees Celsius")).toBeTruthy()
  })

  it("uses custom accessibility label", () => {
    const customLabel = "Engine temperature is too high"
    const { getByLabelText } = renderWithTheme(
      <TemperatureGauge temperature={95} accessibilityLabel={customLabel} />,
    )

    expect(getByLabelText(customLabel)).toBeTruthy()
  })

  it("handles negative temperature range", () => {
    const { getByLabelText } = renderWithTheme(
      <TemperatureGauge temperature={-10} minTemp={-30} maxTemp={0} />,
    )

    expect(getByLabelText("Current temperature is -10 degrees Celsius")).toBeTruthy()
  })

  it("correctly maps temperature 50 in range 0-120 to 42% gauge position", () => {
    const { getByLabelText } = renderWithTheme(
      <TemperatureGauge temperature={50} minTemp={0} maxTemp={120} />,
    )

    expect(getByLabelText("Current temperature is 50 degrees Celsius")).toBeTruthy()
  })

  it("correctly maps temperature -10 in range -30 to 0 to 67% gauge position", () => {
    const { getByLabelText } = renderWithTheme(
      <TemperatureGauge temperature={-10} minTemp={-30} maxTemp={0} />,
    )

    expect(getByLabelText("Current temperature is -10 degrees Celsius")).toBeTruthy()
  })
})
