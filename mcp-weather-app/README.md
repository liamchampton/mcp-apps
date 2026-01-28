# MCP Weather App

A weather forecast app that runs as an MCP App inside MCP-enabled hosts like Claude Desktop. Uses the free Open-Meteo API (no API key required).

## Features

- ☀️ Current weather conditions with emoji icons
- 🌡️ Temperature with "feels like"
- 💧 Humidity percentage
- 💨 Wind speed
- 📅 5-day forecast
- 🌍 Worldwide location support
- 📏 Metric or Imperial units

## Quick Start

```bash
# Install dependencies
npm install

# Build and run
npm start
```

The server starts at `http://localhost:3002/mcp`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build the app |
| `npm run serve` | Run the server |
| `npm start` | Build and run |

## Testing with basic-host

```bash
# Terminal 1: Start this server
npm run serve

# Terminal 2: Run basic-host from MCP ext-apps
git clone --depth 1 https://github.com/modelcontextprotocol/ext-apps.git /tmp/mcp-ext-apps
cd /tmp/mcp-ext-apps/examples/basic-host
npm install --ignore-scripts
SERVERS='["http://localhost:3002/mcp"]' npm run start
```

Open http://localhost:8080 and call the `get-weather` tool.

## Tool

### `get-weather`

Gets current weather and 5-day forecast for a location.

**Input:**
- `location` (required): City name (e.g., "London", "New York", "Tokyo")
- `units` (optional): `"metric"` (default, °C) or `"imperial"` (°F)

**Output:**
- Current conditions: temperature, feels like, humidity, wind, weather icon
- 5-day forecast: daily high/low temperatures and conditions
- Location info: city name, country, coordinates

## Weather Icons

| Icon | Condition |
|------|-----------|
| ☀️ | Clear sky |
| 🌤️ | Partly cloudy |
| 🌫️ | Fog |
| 🌧️ | Rain/Drizzle |
| ❄️ | Snow |
| 🌦️ | Rain showers |
| 🌨️ | Snow showers |
| ⛈️ | Thunderstorm |

## API

Uses [Open-Meteo](https://open-meteo.com/) - free weather API with no API key required.

## License

MIT
