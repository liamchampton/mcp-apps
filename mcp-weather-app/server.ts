import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "dist")
  : import.meta.dirname;

// Open-Meteo API types
interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

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

// Weather code to condition mapping
function getWeatherCondition(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: "Clear sky", icon: "☀️" };
  if (code <= 3) return { condition: "Partly cloudy", icon: "🌤️" };
  if (code <= 48) return { condition: "Foggy", icon: "🌫️" };
  if (code <= 55) return { condition: "Drizzle", icon: "🌧️" };
  if (code <= 57) return { condition: "Freezing drizzle", icon: "🌧️" };
  if (code <= 65) return { condition: "Rain", icon: "🌧️" };
  if (code <= 67) return { condition: "Freezing rain", icon: "🌧️" };
  if (code <= 75) return { condition: "Snow", icon: "❄️" };
  if (code <= 77) return { condition: "Snow grains", icon: "❄️" };
  if (code <= 82) return { condition: "Rain showers", icon: "🌦️" };
  if (code <= 86) return { condition: "Snow showers", icon: "🌨️" };
  if (code === 95) return { condition: "Thunderstorm", icon: "⛈️" };
  if (code <= 99) return { condition: "Thunderstorm with hail", icon: "⛈️" };
  return { condition: "Unknown", icon: "❓" };
}

// Geocoding API
async function geocodeLocation(location: string): Promise<GeocodingResult | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  const data = await response.json() as { results?: GeocodingResult[] };
  return data.results?.[0] ?? null;
}

// Weather API response types
interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
}

// Weather API
async function fetchWeather(
  latitude: number,
  longitude: number,
  units: "metric" | "imperial"
): Promise<{ current: WeatherData["current"]; forecast: WeatherData["forecast"] }> {
  const tempUnit = units === "imperial" ? "fahrenheit" : "celsius";
  const windUnit = units === "imperial" ? "mph" : "kmh";
  
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitude.toString());
  url.searchParams.set("longitude", longitude.toString());
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m");
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,weather_code");
  url.searchParams.set("temperature_unit", tempUnit);
  url.searchParams.set("wind_speed_unit", windUnit);
  url.searchParams.set("forecast_days", "5");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url.toString());
  const data = await response.json() as OpenMeteoResponse;

  const currentWeather = getWeatherCondition(data.current.weather_code);
  
  return {
    current: {
      temperature: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      weatherCode: data.current.weather_code,
      condition: currentWeather.condition,
      icon: currentWeather.icon,
    },
    forecast: data.daily.time.map((date: string, i: number) => {
      const forecastWeather = getWeatherCondition(data.daily.weather_code[i]);
      return {
        date,
        tempMax: Math.round(data.daily.temperature_2m_max[i]),
        tempMin: Math.round(data.daily.temperature_2m_min[i]),
        weatherCode: data.daily.weather_code[i],
        condition: forecastWeather.condition,
        icon: forecastWeather.icon,
      };
    }),
  };
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: "Weather MCP App Server",
    version: "1.0.0",
  });

  const resourceUri = "ui://get-weather/mcp-app.html";

  registerAppTool(
    server,
    "get-weather",
    {
      title: "Get Weather",
      description: "Get current weather and 5-day forecast for a location. Returns temperature, conditions, humidity, wind, and forecast.",
      inputSchema: z.object({
        location: z.string().describe("City name (e.g., 'London', 'New York', 'Tokyo')"),
        units: z.enum(["metric", "imperial"]).optional().default("metric").describe("Temperature units: 'metric' (°C) or 'imperial' (°F)"),
      }),
      _meta: { ui: { resourceUri } },
    },
    async ({ location, units = "metric" }): Promise<CallToolResult> => {
      try {
        const geo = await geocodeLocation(location);
        if (!geo) {
          return {
            content: [{ type: "text", text: `Location not found: ${location}` }],
            isError: true,
          };
        }

        const weather = await fetchWeather(geo.latitude, geo.longitude, units);
        const tempUnit = units === "metric" ? "°C" : "°F";
        const windUnit = units === "metric" ? "km/h" : "mph";

        const weatherData: WeatherData = {
          location: {
            name: geo.name,
            country: geo.country,
            latitude: geo.latitude,
            longitude: geo.longitude,
          },
          current: weather.current,
          forecast: weather.forecast,
          units,
        };

        const textSummary = `Weather for ${geo.name}, ${geo.country}:
${weather.current.icon} ${weather.current.condition}
🌡️ ${weather.current.temperature}${tempUnit} (feels like ${weather.current.feelsLike}${tempUnit})
💧 Humidity: ${weather.current.humidity}%
💨 Wind: ${weather.current.windSpeed} ${windUnit}

5-Day Forecast:
${weather.forecast.map(d => `${d.date}: ${d.icon} ${d.tempMin}–${d.tempMax}${tempUnit}`).join("\n")}`;

        return {
          content: [{ type: "text", text: textSummary }],
          structuredContent: weatherData as unknown as Record<string, unknown>,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
          content: [{ type: "text", text: `Error fetching weather: ${message}` }],
          isError: true,
        };
      }
    },
  );

  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(path.join(DIST_DIR, "mcp-app.html"), "utf-8");
      return {
        contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html }],
      };
    },
  );

  return server;
}
