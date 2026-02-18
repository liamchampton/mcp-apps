/**
 * Flamegraph Profiler MCP App - React UI
 */
import type { App, McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Flamegraph } from "./components/Flamegraph";
import { TopFunctions } from "./components/TopFunctions";
import { ProfileSummary } from "./components/ProfileSummary";

// Types matching server.ts
interface ProfileFrame {
  name: string;
  value: number;
  children?: ProfileFrame[];
}

interface ProfileData {
  name: string;
  duration: number;
  sampleCount: number;
  topFunctions: Array<{ name: string; percentage: number; samples: number }>;
  flamegraphData: ProfileFrame;
  rawProfile?: string;
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "100%",
    margin: "0 auto",
    fontFamily: "var(--font-sans, system-ui, sans-serif)",
  },
  header: {
    textAlign: "center",
    marginBottom: "8px",
  },
  title: {
    fontSize: "var(--font-heading-lg-size, 24px)",
    fontWeight: "var(--font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
    margin: "0 0 4px 0",
    color: "var(--color-text-primary, #1a1a1a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  subtitle: {
    fontSize: "var(--font-text-sm-size, 14px)",
    color: "var(--color-text-secondary, #666)",
    margin: 0,
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
  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
  },
  tab: {
    padding: "8px 16px",
    border: "1px solid var(--color-border-primary, #e5e5e5)",
    borderRadius: "var(--border-radius-md, 8px)",
    background: "var(--color-background-secondary, #f5f5f5)",
    cursor: "pointer",
    fontSize: "var(--font-text-sm-size, 14px)",
    transition: "all 0.15s",
  },
  tabActive: {
    background: "var(--color-text-primary, #1a1a1a)",
    color: "var(--color-background-primary, #ffffff)",
    borderColor: "var(--color-text-primary, #1a1a1a)",
  },
};

function FlameApp() {
  const [toolResult, setToolResult] = useState<CallToolResult | null>(null);
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>();

  const { app, error } = useApp({
    appInfo: { name: "Flamegraph Profiler", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.onteardown = async () => {
        console.info("Flamegraph app is being torn down");
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
    <FlameAppInner
      app={app}
      toolResult={toolResult}
      hostContext={hostContext}
    />
  );
}

interface FlameAppInnerProps {
  app: App;
  toolResult: CallToolResult | null;
  hostContext?: McpUiHostContext;
}

type TabType = "flamegraph" | "top-functions" | "summary";

function FlameAppInner({ toolResult, hostContext }: FlameAppInnerProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("flamegraph");

  useEffect(() => {
    if (toolResult) {
      if (toolResult.isError) {
        const text = toolResult.content?.find((c) => c.type === "text");
        setErrorMsg(text && "text" in text ? text.text : "An error occurred");
        setProfileData(null);
      } else if (toolResult.structuredContent) {
        const data = toolResult.structuredContent as unknown as ProfileData;
        setProfileData(data);
        setErrorMsg(null);
      }
    }
  }, [toolResult]);

  if (!profileData && !errorMsg) {
    return <div style={styles.loading}>🔥 Waiting for profile data...</div>;
  }

  if (errorMsg) {
    return <div style={styles.error}>❌ {errorMsg}</div>;
  }

  if (!profileData) {
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
      <header style={styles.header}>
        <h1 style={styles.title}>
          🔥 {profileData.name}
        </h1>
        <p style={styles.subtitle}>
          Profile: {profileData.duration.toFixed(2)}s • {profileData.sampleCount} samples
        </p>
      </header>

      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "flamegraph" ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab("flamegraph")}
        >
          🔥 Flamegraph
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "top-functions" ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab("top-functions")}
        >
          📊 Top Functions
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "summary" ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab("summary")}
        >
          📋 Summary
        </button>
      </div>

      {activeTab === "flamegraph" && (
        <Flamegraph data={profileData.flamegraphData} />
      )}
      {activeTab === "top-functions" && (
        <TopFunctions functions={profileData.topFunctions} />
      )}
      {activeTab === "summary" && (
        <ProfileSummary profile={profileData} />
      )}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FlameApp />
  </StrictMode>
);
