/**
 * Weather App MCP App - React UI
 */
import type { App, McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { StrictMode, useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CurrentWeather } from "./components/CurrentWeather";
import { Forecast } from "./components/Forecast";

// Types matching server.ts
interface WeatherData {
  location: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    condition: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    weatherCode: number;
    condition: string;
    icon: string;
  }>;
  units: "metric" | "imperial";
}

// Unit conversion utilities
function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

function fahrenheitToCelsius(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371);
}

function mphToKmh(mph: number): number {
  return Math.round(mph / 0.621371);
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "480px",
    margin: "0 auto",
    fontFamily: "var(--font-sans, system-ui, sans-serif)",
  },
  header: {
    textAlign: "center",
    marginBottom: "8px",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  locationInfo: {
    textAlign: "left",
    flex: 1,
  },
  location: {
    fontSize: "var(--font-heading-lg-size, 24px)",
    fontWeight: "var(--font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
    margin: "0 0 4px 0",
    color: "var(--color-text-primary, #1a1a1a)",
  },
  country: {
    fontSize: "var(--font-text-sm-size, 14px)",
    color: "var(--color-text-secondary, #666)",
    margin: 0,
  },
  unitToggle: {
    display: "flex",
    borderRadius: "var(--border-radius-md, 8px)",
    overflow: "hidden",
    border: "1px solid var(--color-border-primary, #e5e5e5)",
  },
  unitButton: {
    padding: "6px 12px",
    fontSize: "var(--font-text-sm-size, 14px)",
    fontWeight: "var(--font-weight-medium, 500)" as React.CSSProperties["fontWeight"],
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.15s, color 0.15s",
  },
  unitButtonActive: {
    background: "var(--color-text-primary, #1a1a1a)",
    color: "var(--color-background-primary, #ffffff)",
  },
  unitButtonInactive: {
    background: "var(--color-background-secondary, #f5f5f5)",
    color: "var(--color-text-secondary, #666)",
  },
  loading: {
    textAlign: "center",
    padding: "40px 20px",
    color: "var(--color-text-secondary, #666)",
  },
  error: {
    textAlign: "center",
    padding: "20px",
    color: "#ef4444",
    background: "var(--color-background-secondary, #fef2f2)",
    borderRadius: "var(--border-radius-md, 8px)",
  },
};

function WeatherApp() {
  const [toolResult, setToolResult] = useState<CallToolResult | null>(null);
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>();

  const { app, error } = useApp({
    appInfo: { name: "Weather App", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.onteardown = async () => {
        console.info("Weather app is being torn down");
        return {};
      };

      app.ontoolinput = async (input) => {
        console.info("Received tool input:", input);
      };

      app.ontoolresult = async (result) => {
        console.info("Received tool result:", result);
        setToolResult(result);
      };

      app.ontoolcancelled = (params) => {
        console.info("Tool call cancelled:", params.reason);
      };

      app.onerror = console.error;

      app.onhostcontextchanged = (params) => {
        setHostContext((prev) => ({ ...prev, ...params }));
      };
    },
  });

  useHostStyles(app ?? null);

  useEffect(() => {
    if (app) {
      setHostContext(app.getHostContext());
    }
  }, [app]);

  if (error) return <div style={{ padding: 16 }}><strong>ERROR:</strong> {error.message}</div>;
  if (!app) return <div style={styles.loading}>Connecting...</div>;

  return (
    <WeatherAppInner
      app={app}
      toolResult={toolResult}
      hostContext={hostContext}
    />
  );
}

interface WeatherAppInnerProps {
  app: App;
  toolResult: CallToolResult | null;
  hostContext?: McpUiHostContext;
}

function WeatherAppInner({ toolResult, hostContext }: WeatherAppInnerProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [displayUnits, setDisplayUnits] = useState<"metric" | "imperial">("metric");

  useEffect(() => {
    if (toolResult) {
      if (toolResult.isError) {
        const text = toolResult.content?.find((c) => c.type === "text");
        setErrorMsg(text && "text" in text ? text.text : "An error occurred");
        setWeatherData(null);
      } else if (toolResult.structuredContent) {
        const data = toolResult.structuredContent as unknown as WeatherData;
        setWeatherData(data);
        setDisplayUnits(data.units); // Initialize with data's units
        setErrorMsg(null);
      }
    }
  }, [toolResult]);

  // Convert temperature based on display units vs data units
  const convertTemp = useCallback((temp: number): number => {
    if (!weatherData) return temp;
    if (weatherData.units === displayUnits) return temp;
    if (displayUnits === "imperial") return celsiusToFahrenheit(temp);
    return fahrenheitToCelsius(temp);
  }, [weatherData, displayUnits]);

  // Convert wind speed based on display units vs data units
  const convertWind = useCallback((wind: number): number => {
    if (!weatherData) return wind;
    if (weatherData.units === displayUnits) return wind;
    if (displayUnits === "imperial") return kmhToMph(wind);
    return mphToKmh(wind);
  }, [weatherData, displayUnits]);

  if (!weatherData && !errorMsg) {
    return <div style={styles.loading}>⏳ Waiting for weather data...</div>;
  }

  if (errorMsg) {
    return <div style={styles.error}>❌ {errorMsg}</div>;
  }

  if (!weatherData) {
    return null;
  }

  const tempUnit = displayUnits === "metric" ? "°C" : "°F";
  const windUnit = displayUnits === "metric" ? "km/h" : "mph";

  // Convert current weather data
  const convertedCurrent = {
    ...weatherData.current,
    temperature: convertTemp(weatherData.current.temperature),
    feelsLike: convertTemp(weatherData.current.feelsLike),
    windSpeed: convertWind(weatherData.current.windSpeed),
  };

  // Convert forecast data
  const convertedForecast = weatherData.forecast.map((day) => ({
    ...day,
    tempMax: convertTemp(day.tempMax),
    tempMin: convertTemp(day.tempMin),
  }));

  return (
    <main
      style={{
        ...styles.main,
        paddingTop: hostContext?.safeAreaInsets?.top ?? 16,
        paddingRight: hostContext?.safeAreaInsets?.right ?? 16,
        paddingBottom: hostContext?.safeAreaInsets?.bottom ?? 16,
        paddingLeft: hostContext?.safeAreaInsets?.left ?? 16,
      }}
    >
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.locationInfo}>
            <h1 style={styles.location}>{weatherData.location.name}</h1>
            <p style={styles.country}>{weatherData.location.country}</p>
          </div>
          <div style={styles.unitToggle}>
            <button
              style={{
                ...styles.unitButton,
                ...(displayUnits === "metric" ? styles.unitButtonActive : styles.unitButtonInactive),
              }}
              onClick={() => setDisplayUnits("metric")}
            >
              °C
            </button>
            <button
              style={{
                ...styles.unitButton,
                ...(displayUnits === "imperial" ? styles.unitButtonActive : styles.unitButtonInactive),
              }}
              onClick={() => setDisplayUnits("imperial")}
            >
              °F
            </button>
          </div>
        </div>
      </header>

      <CurrentWeather
        current={convertedCurrent}
        tempUnit={tempUnit}
        windUnit={windUnit}
      />

      <Forecast
        forecast={convertedForecast}
        tempUnit={tempUnit}
      />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WeatherApp />
  </StrictMode>
);
