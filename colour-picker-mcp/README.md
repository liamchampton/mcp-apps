# Colour Picker MCP App

A full-featured colour picker that runs as an MCP App inside MCP-enabled hosts like Claude Desktop.

## Features

- 🎨 Large colour preview swatch
- 🔤 Hex input with live validation
- 🌈 HSL sliders with gradient backgrounds
- 🔴🟢🔵 RGB sliders
- 🎯 EyeDropper - pick colours from screen (Chrome/Edge only)
- 🧭 24-colour preset palette
- ⏱️ Recent colours tracking
- 🎭 Automatic host theme integration

## Quick Start

```bash
# Install dependencies
npm install

# Build and run
npm start
```

The server starts at `http://localhost:3001/mcp`

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
SERVERS='["http://localhost:3001/mcp"]' npm run start
```

Open http://localhost:8080 and call the `pick-colour` tool.

## Tool

### `pick-colour`

Opens an interactive colour picker UI.

**Input:**
- `initialColour` (optional): Starting colour in hex format (e.g. `#ff0000`). Defaults to `#3b82f6`.

**Output:**
- `hex`: Colour in hex format
- `rgb`: Object with `r`, `g`, `b` values (0-255)
- `hsl`: Object with `h` (0-360), `s` (0-100), `l` (0-100) values

## License

MIT
