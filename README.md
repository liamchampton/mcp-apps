# MCP Apps Demo

A collection of example MCP Apps demonstrating how to build interactive UIs that run inside MCP-enabled hosts like VS Code/GitHub Copilot and Claude Desktop.

## What are MCP Apps?

MCP Apps combine MCP tools with HTML resources to display rich, interactive content. When a host calls an MCP tool, the server returns both data and a UI that renders the result.

```
Host calls tool → Server returns result → Host renders resource UI → UI receives result
```

## Example Apps

| App | Description |
|-----|-------------|
| [Colour Picker](colour-picker-mcp/) | Interactive colour picker with hex/RGB/HSL support |
| [Weather App](mcp-weather-app/) | Weather forecasts using Open-Meteo API |

Each app has its own README with detailed documentation.

## Quick start for each App

Each app in this repo follows the same pattern:

```bash
# Navigate to any app directory
cd <app-name>

# Install dependencies
npm install

# Build and run
npm start
```

The server will start and display its URL.

## Connecting to Apps

Apps can be accessed locally or remotely:

### Local (localhost)

Run the app locally and connect via `localhost`:

```json
{
  "servers": {
    "<app-name>": {
      "type": "http",
      "url": "http://localhost:<port>/mcp"
    }
  }
}
```

### Remote (Cloudflare Tunnel)

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

### Remote (Azure Dev Tunnels)

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
