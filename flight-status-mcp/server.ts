import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "dist")
  : import.meta.dirname;

// Flight status types
type FlightStatus = "On Time" | "Delayed" | "Boarding" | "Departed" | "In Air" | "Landed" | "Cancelled";

interface FlightData {
  flightNumber: string;
  airline: string;
  status: FlightStatus;
  statusIcon: string;
  departure: {
    airport: string;
    airportCode: string;
    terminal: string;
    gate: string;
    scheduledTime: string;
    estimatedTime: string;
  };
  arrival: {
    airport: string;
    airportCode: string;
    terminal: string;
    gate: string;
    scheduledTime: string;
    estimatedTime: string;
  };
  aircraft: string;
  duration: string;
  distance: string;
}



// Demo flight data (simulates API response)
function getDemoFlightData(flightNumber: string): FlightData | null {
  const normalized = flightNumber.toUpperCase().replace(/\s+/g, "");
  
  // Demo flights database
  const flights: Record<string, FlightData> = {
    "BA123": {
      flightNumber: "BA123",
      airline: "British Airways",
      status: "On Time",
      statusIcon: "✅",
      departure: {
        airport: "London Heathrow",
        airportCode: "LHR",
        terminal: "5",
        gate: "A10",
        scheduledTime: "14:30",
        estimatedTime: "14:30",
      },
      arrival: {
        airport: "New York JFK",
        airportCode: "JFK",
        terminal: "7",
        gate: "B22",
        scheduledTime: "17:45",
        estimatedTime: "17:45",
      },
      aircraft: "Boeing 777-300ER",
      duration: "8h 15m",
      distance: "5,555 km",
    },
    "UA456": {
      flightNumber: "UA456",
      airline: "United Airlines",
      status: "Delayed",
      statusIcon: "⏳",
      departure: {
        airport: "San Francisco",
        airportCode: "SFO",
        terminal: "3",
        gate: "G92",
        scheduledTime: "09:00",
        estimatedTime: "10:15",
      },
      arrival: {
        airport: "Los Angeles",
        airportCode: "LAX",
        terminal: "7",
        gate: "71A",
        scheduledTime: "10:30",
        estimatedTime: "11:45",
      },
      aircraft: "Airbus A320",
      duration: "1h 30m",
      distance: "543 km",
    },
    "AA789": {
      flightNumber: "AA789",
      airline: "American Airlines",
      status: "In Air",
      statusIcon: "✈️",
      departure: {
        airport: "Dallas/Fort Worth",
        airportCode: "DFW",
        terminal: "D",
        gate: "D40",
        scheduledTime: "06:00",
        estimatedTime: "06:00",
      },
      arrival: {
        airport: "Miami",
        airportCode: "MIA",
        terminal: "N",
        gate: "N7",
        scheduledTime: "10:15",
        estimatedTime: "10:10",
      },
      aircraft: "Boeing 737 MAX 8",
      duration: "3h 15m",
      distance: "1,753 km",
    },
    "DL321": {
      flightNumber: "DL321",
      airline: "Delta Air Lines",
      status: "Boarding",
      statusIcon: "🚶",
      departure: {
        airport: "Atlanta",
        airportCode: "ATL",
        terminal: "S",
        gate: "S4",
        scheduledTime: "15:45",
        estimatedTime: "15:45",
      },
      arrival: {
        airport: "Chicago O'Hare",
        airportCode: "ORD",
        terminal: "2",
        gate: "E5",
        scheduledTime: "17:30",
        estimatedTime: "17:25",
      },
      aircraft: "Airbus A321",
      duration: "1h 45m",
      distance: "975 km",
    },
    "LH999": {
      flightNumber: "LH999",
      airline: "Lufthansa",
      status: "Cancelled",
      statusIcon: "❌",
      departure: {
        airport: "Frankfurt",
        airportCode: "FRA",
        terminal: "1",
        gate: "A26",
        scheduledTime: "08:00",
        estimatedTime: "-",
      },
      arrival: {
        airport: "Munich",
        airportCode: "MUC",
        terminal: "2",
        gate: "-",
        scheduledTime: "09:05",
        estimatedTime: "-",
      },
      aircraft: "Airbus A320neo",
      duration: "1h 05m",
      distance: "304 km",
    },
  };

  return flights[normalized] ?? null;
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: "Flight Status MCP App Server",
    version: "1.0.0",
  });

  const resourceUri = "ui://get-flight-status/mcp-app.html";

  registerAppTool(
    server,
    "get-flight-status",
    {
      title: "Get Flight Status",
      description: "Get real-time status for a flight. Returns departure/arrival times, gates, terminals, delays, and current status.",
      inputSchema: z.object({
        flightNumber: z.string().describe("Flight number (e.g., 'BA123', 'UA456', 'AA789')"),
      }),
      _meta: { ui: { resourceUri } },
    },
    async ({ flightNumber }): Promise<CallToolResult> => {
      try {
        const flight = getDemoFlightData(flightNumber);
        
        if (!flight) {
          return {
            content: [{ type: "text", text: `Flight not found: ${flightNumber}. Try: BA123, UA456, AA789, DL321, or LH999` }],
            isError: true,
          };
        }

        const textSummary = `${flight.statusIcon} ${flight.flightNumber} - ${flight.airline}
Status: ${flight.status}

Departure: ${flight.departure.airportCode} (${flight.departure.airport})
  Terminal ${flight.departure.terminal}, Gate ${flight.departure.gate}
  Scheduled: ${flight.departure.scheduledTime} | Estimated: ${flight.departure.estimatedTime}

Arrival: ${flight.arrival.airportCode} (${flight.arrival.airport})
  Terminal ${flight.arrival.terminal}, Gate ${flight.arrival.gate}
  Scheduled: ${flight.arrival.scheduledTime} | Estimated: ${flight.arrival.estimatedTime}

Aircraft: ${flight.aircraft}
Duration: ${flight.duration} | Distance: ${flight.distance}`;

        return {
          content: [{ type: "text", text: textSummary }],
          structuredContent: flight as unknown as Record<string, unknown>,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
          content: [{ type: "text", text: `Error fetching flight status: ${message}` }],
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
