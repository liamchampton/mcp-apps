# MCP Apps Demo

A collection of example MCP Apps demonstrating how to build interactive UIs that run inside MCP-enabled hosts like VS Code/GitHub Copilot and Claude Desktop.

## What are MCP Apps?

MCP Apps combine MCP tools with HTML resources to display rich, interactive content. When a host calls an MCP tool, the server returns both data and a UI that renders the result.

```
Host calls tool → Server returns result → Host renders resource UI → UI receives result
```

## Example Apps

| App | Description | Default Port |
|-----|-------------|:------------:|
| [Colour Picker](colour-picker-mcp/) | Interactive colour picker with hex/RGB/HSL support | 3001 |
| [Weather App](mcp-weather-app/) | Weather forecasts using Open-Meteo API | 3002 |
| [Flight Status](flight-status-mcp/) | Real-time flight status lookup | 3003 |
| [Flamegraph Profiler](flamegraph-profiler-mcp/) | Go application CPU/memory profiling with interactive flamegraphs | 3003 |

Each app has its own README with detailed documentation.

## Prerequisites

- **[Node.js](https://nodejs.org/) v18 or later** (includes `npm`)
- **[Go](https://go.dev/) 1.19+** — only required for the Flamegraph Profiler app
- **[Git](https://git-scm.com/)** — to clone the repository

Verify your setup:

```bash
node -v   # should print v18.x or higher
npm -v    # should print 9.x or higher
git --version
```

## Local Installation

### 1. Clone the repository

```bash
git clone https://github.com/liamchampton/mcp-apps.git
cd mcp-apps
```

### 2. Install, build, and run an app

Each app in this repo follows the same pattern. Pick one (or more) and run:

```bash
# Navigate to the app directory
cd colour-picker-mcp   # or mcp-weather-app, flight-status-mcp, flamegraph-profiler-mcp

# Install dependencies
npm install

# Build and start the server
npm start
```

The terminal will confirm the server is running and print the local URL (e.g. `http://localhost:3001/mcp`).

> **Tip:** To run multiple apps at the same time, open a separate terminal for each one. The Flight Status and Flamegraph Profiler apps both default to port 3003, so set a custom port for one of them if you need both running simultaneously:
> ```bash
> PORT=3004 npm start
> ```

### 3. Connect the MCP server to your host

#### VS Code / GitHub Copilot

Add the server to your workspace MCP configuration. Create or edit `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "colour-picker-mcp": {
      "type": "http",
      "url": "http://localhost:3001/mcp"
    },
    "weather-mcp": {
      "type": "http",
      "url": "http://localhost:3002/mcp"
    },
    "flight-status": {
      "type": "http",
      "url": "http://localhost:3003/mcp"
    },
    "flamegraph-mcp": {
      "type": "http",
      "url": "http://localhost:3003/mcp"
    }
  }
}
```

Then open Copilot Chat in **Agent mode** and the tools will be available automatically.

#### Claude Desktop

Add the server to your Claude Desktop config file:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "colour-picker-mcp": {
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

Restart Claude Desktop after saving the config.

### 4. Use the tools

Once connected, ask your AI host to use the tool. For example:

- *"Pick a colour"* → triggers the `pick-colour` tool
- *"What's the weather in London?"* → triggers the `get-weather` tool
- *"Check the status of flight BA123"* → triggers the `get-flight-status` tool
- *"Profile the app at ./sample-app/main.go"* → triggers the `profile-app` tool

## Connecting Remotely

Apps can also be exposed over the internet:

### Cloudflare Tunnel

Expose your local server to the internet using [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/):

```bash
# Start your app
npm start

# In another terminal, create a tunnel
cloudflared tunnel --url http://localhost:<port>
```

Then use the generated URL in your MCP config:

```json
{
  "servers": {
    "<app-name>": {
      "type": "http",
      "url": "https://<your-tunnel>.trycloudflare.com/mcp"
    }
  }
}
```

This is useful for sharing apps with others or accessing from different machines.

### Azure Dev Tunnels

Expose your local server using [Azure Dev Tunnels](https://learn.microsoft.com/en-us/azure/developer/dev-tunnels/get-started?tabs=macos):

```bash
# Install dev tunnel CLI (macOS)
brew install --cask microsoft-developer-tunnel

# Or on Windows using winget
winget install Microsoft.devtunnel

# Login (use Microsoft or GitHub account)
devtunnel user login

# Start your app
npm start

# In another terminal, create a tunnel
devtunnel host -p <port>

# For public access (optional)
devtunnel host -p <port> --allow-anonymous
```

You'll receive a public URL like `https://<tunnel-id>.<region>.devtunnels.ms`. Use it in your MCP config:

```json
{
  "servers": {
    "<app-name>": {
      "type": "http",
      "url": "https://<tunnel-id>.<region>.devtunnels.ms/mcp"
    }
  }
}
```

See the [Azure Dev Tunnels documentation](https://learn.microsoft.com/en-us/azure/developer/dev-tunnels/get-started?tabs=macos) for more options.

### Deploy to Azure

Deploy your MCP app to [Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/) for a fully hosted solution:

```bash
# Login to Azure
az login

# Create a resource group
az group create --name mcp-apps-rg --location eastus

# Deploy using Azure Container Apps
az containerapp up \
  --name <app-name> \
  --resource-group mcp-apps-rg \
  --source .
```

Then use your Azure URL:

```json
{
  "servers": {
    "<app-name>": {
      "type": "http",
      "url": "https://<app-name>.<region>.azurecontainerapps.io/mcp"
    }
  }
}
```

See the [Azure Container Apps documentation](https://learn.microsoft.com/en-us/azure/container-apps/quickstart-code-to-cloud) for more deployment options.

## Testing with basic-host

Test apps locally using the MCP basic-host:

```bash
# Clone the ext-apps repo
git clone --depth 1 https://github.com/modelcontextprotocol/ext-apps.git /tmp/mcp-ext-apps

# Run basic-host
cd /tmp/mcp-ext-apps/examples/basic-host
npm install --ignore-scripts
SERVERS='["<your-app-url>"]' npm run start
```

Open http://localhost:8080 to test the tools.

## App Structure

Each app follows a consistent structure:

```
<app-name>/
├── server.ts          # MCP server with tool/resource registration
├── main.ts            # Entry point
├── mcp-app.html       # HTML template
├── src/               # UI components
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Quick start for creating a new MCP App

### Building Your Own MCP App

See [SKILL.md](SKILL.md) for comprehensive guidance on:
- Tool + Resource pattern
- Framework selection (React, Vanilla JS, Vue, etc.)
- Host styling integration
- Streaming partial input
- Fullscreen mode
- Common patterns and mistakes to avoid

> **Note:** SKILL.md is sourced from the official [MCP ext-apps repository](https://github.com/modelcontextprotocol/ext-apps/blob/main/plugins/mcp-apps/skills/create-mcp-app/SKILL.md).

### Using Copilot CLI

```bash
# Install Copilot CLI if you haven't already
npm install -g @githubnext/copilot-cli

# Navigate to the root of this project repository
cd mcp-apps

# Create a new MCP App
copilot create a new MCP App for <your-app-name>
```

Once installed, follow the quick start instructions above to run and test your new app (you should also see the output in the terminal for how to do this once it has finished creating the project).

## License

MIT
