# Flight Status MCP App

An MCP App that provides real-time flight status information.

## Features

- Look up flight status by flight number
- View departure and arrival times (scheduled and estimated)
- See terminal and gate information
- Track delays and cancellations
- Aircraft and route details

## Usage

Query flight status with:
- `BA123` - British Airways (On Time)
- `UA456` - United Airlines (Delayed)
- `AA789` - American Airlines (In Air)
- `DL321` - Delta Air Lines (Boarding)
- `LH999` - Lufthansa (Cancelled)

## Development

```bash
# Install dependencies
npm install

# Build and run
npm start

# Or build and serve separately
npm run build
npm run serve
```

## Running

The server runs on `http://localhost:3003/mcp` by default.

For stdio mode:
```bash
npm run serve -- --stdio
```
