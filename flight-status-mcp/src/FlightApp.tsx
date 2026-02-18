/**
 * Flight Status MCP App - React UI
 */
import type { App, McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { FlightCard } from "./components/FlightCard";
import { FlightDetails } from "./components/FlightDetails";

// Types matching server.ts
interface FlightData {
  flightNumber: string;
  airline: string;
  status: string;
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

function FlightApp() {
  const [toolResult, setToolResult] = useState<CallToolResult | null>(null);
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>();

  const { app, error } = useApp({
    appInfo: { name: "Flight Status", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.onteardown = async () => {
        console.info("Flight app is being torn down");
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
    <FlightAppInner
      app={app}
      toolResult={toolResult}
      hostContext={hostContext}
    />
  );
}

interface FlightAppInnerProps {
  app: App;
  toolResult: CallToolResult | null;
  hostContext?: McpUiHostContext;
}

function FlightAppInner({ toolResult, hostContext }: FlightAppInnerProps) {
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (toolResult) {
      if (toolResult.isError) {
        const text = toolResult.content?.find((c) => c.type === "text");
        setErrorMsg(text && "text" in text ? text.text : "An error occurred");
        setFlightData(null);
      } else if (toolResult.structuredContent) {
        const data = toolResult.structuredContent as unknown as FlightData;
        setFlightData(data);
        setErrorMsg(null);
      }
    }
  }, [toolResult]);

  if (!flightData && !errorMsg) {
    return <div style={styles.loading}>✈️ Waiting for flight data...</div>;
  }

  if (errorMsg) {
    return <div style={styles.error}>❌ {errorMsg}</div>;
  }

  if (!flightData) {
    return null;
  }

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
      <FlightCard flight={flightData} />
      <FlightDetails flight={flightData} />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FlightApp />
  </StrictMode>
);
