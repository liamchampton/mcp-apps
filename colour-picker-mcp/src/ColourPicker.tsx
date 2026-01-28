/**
 * Colour Picker MCP App - React UI
 */
import type { App, McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { StrictMode, useCallback, useEffect, useState, useMemo } from "react";
import { createRoot } from "react-dom/client";

// Colour conversion utilities
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const l = (max + min) / 2;

  let h = 0,
    s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / d + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / d + 4) / 6;
        break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const hNorm = h / 360;

  if (sNorm === 0) {
    const val = Math.round(lNorm * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;
  return {
    r: Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hNorm) * 255),
    b: Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255),
  };
}

// Styles
const styles: Record<string, React.CSSProperties> = {
  main: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "400px",
    margin: "0 auto",
    fontFamily: "var(--font-sans, system-ui, sans-serif)",
  },
  preview: {
    width: "100%",
    height: "80px",
    borderRadius: "var(--border-radius-lg, 12px)",
    border: "2px solid var(--color-border-primary, #e5e5e5)",
    transition: "background-color 0.15s ease",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "var(--font-text-sm-size, 14px)",
    fontWeight: "var(--font-weight-medium, 500)" as React.CSSProperties["fontWeight"],
    color: "var(--color-text-secondary, #666)",
  },
  inputGroup: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "var(--border-radius-md, 8px)",
    border: "1px solid var(--color-border-primary, #e5e5e5)",
    background: "var(--color-background-secondary, #f5f5f5)",
    color: "var(--color-text-primary, #1a1a1a)",
    fontSize: "var(--font-text-sm-size, 14px)",
    fontFamily: "var(--font-mono, monospace)",
    outline: "none",
  },
  slider: {
    flex: 1,
    height: "8px",
    borderRadius: "4px",
    appearance: "none" as React.CSSProperties["appearance"],
    cursor: "pointer",
  },
  numberInput: {
    width: "60px",
    padding: "6px 8px",
    borderRadius: "var(--border-radius-md, 8px)",
    border: "1px solid var(--color-border-primary, #e5e5e5)",
    background: "var(--color-background-secondary, #f5f5f5)",
    color: "var(--color-text-primary, #1a1a1a)",
    fontSize: "var(--font-text-sm-size, 14px)",
    fontFamily: "var(--font-mono, monospace)",
    textAlign: "center" as React.CSSProperties["textAlign"],
    outline: "none",
  },
  button: {
    padding: "10px 16px",
    borderRadius: "var(--border-radius-md, 8px)",
    border: "none",
    background: "var(--color-background-tertiary, #3b82f6)",
    color: "#ffffff",
    fontSize: "var(--font-text-sm-size, 14px)",
    fontWeight: "var(--font-weight-medium, 500)" as React.CSSProperties["fontWeight"],
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  palette: {
    display: "grid",
    gridTemplateColumns: "repeat(8, 1fr)",
    gap: "6px",
  },
  paletteColour: {
    width: "100%",
    aspectRatio: "1",
    borderRadius: "var(--border-radius-sm, 4px)",
    border: "2px solid transparent",
    cursor: "pointer",
    transition: "transform 0.1s ease, border-color 0.1s ease",
  },
  outputSection: {
    padding: "12px",
    borderRadius: "var(--border-radius-md, 8px)",
    background: "var(--color-background-secondary, #f5f5f5)",
    fontSize: "var(--font-text-sm-size, 14px)",
    fontFamily: "var(--font-mono, monospace)",
  },
};

const DEFAULT_PALETTE = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#f43f5e", "#64748b", "#1e293b", "#0f172a", "#ffffff", "#f1f5f9", "#cbd5e1", "#000000",
];

function ColourPickerApp() {
  const [toolResult, setToolResult] = useState<CallToolResult | null>(null);
  const [toolInput, setToolInput] = useState<{ initialColour?: string } | null>(null);
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>();

  const { app, error } = useApp({
    appInfo: { name: "Colour Picker", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.onteardown = async () => {
        console.info("Colour Picker app is being torn down");
        return {};
      };

      app.ontoolinput = async (input) => {
        console.info("Received tool input:", input);
        setToolInput(input.arguments as { initialColour?: string });
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
  if (!app) return <div style={{ padding: 16 }}>Connecting...</div>;

  return (
    <ColourPickerInner
      app={app}
      toolResult={toolResult}
      toolInput={toolInput}
      hostContext={hostContext}
    />
  );
}

interface ColourPickerInnerProps {
  app: App;
  toolResult: CallToolResult | null;
  toolInput: { initialColour?: string } | null;
  hostContext?: McpUiHostContext;
}

function ColourPickerInner({ app, toolInput, hostContext }: ColourPickerInnerProps) {
  const initialColour = toolInput?.initialColour ?? "#3b82f6";
  const initialRgb = hexToRgb(initialColour);
  const initialHsl = rgbToHsl(initialRgb.r, initialRgb.g, initialRgb.b);

  const [hsl, setHsl] = useState(initialHsl);
  const [hexInput, setHexInput] = useState(initialColour);
  const [recentColours, setRecentColours] = useState<string[]>([]);

  // Derived RGB and Hex values
  const rgb = useMemo(() => hslToRgb(hsl.h, hsl.s, hsl.l), [hsl]);
  const hex = useMemo(() => rgbToHex(rgb.r, rgb.g, rgb.b), [rgb]);

  // Sync hex input when colour changes from sliders
  useEffect(() => {
    setHexInput(hex);
  }, [hex]);

  // Update from initial colour when tool input changes
  useEffect(() => {
    if (toolInput?.initialColour) {
      const newRgb = hexToRgb(toolInput.initialColour);
      const newHsl = rgbToHsl(newRgb.r, newRgb.g, newRgb.b);
      setHsl(newHsl);
      setHexInput(toolInput.initialColour);
    }
  }, [toolInput?.initialColour]);

  const handleHexChange = useCallback((value: string) => {
    setHexInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      const newRgb = hexToRgb(value);
      const newHsl = rgbToHsl(newRgb.r, newRgb.g, newRgb.b);
      setHsl(newHsl);
    }
  }, []);

  const handleRgbChange = useCallback((channel: "r" | "g" | "b", value: number) => {
    const newRgb = { ...rgb, [channel]: Math.max(0, Math.min(255, value)) };
    const newHsl = rgbToHsl(newRgb.r, newRgb.g, newRgb.b);
    setHsl(newHsl);
  }, [rgb]);

  const handleHslChange = useCallback((channel: "h" | "s" | "l", value: number) => {
    const max = channel === "h" ? 360 : 100;
    setHsl((prev) => ({ ...prev, [channel]: Math.max(0, Math.min(max, value)) }));
  }, []);

  const handlePaletteSelect = useCallback((colour: string) => {
    const newRgb = hexToRgb(colour);
    const newHsl = rgbToHsl(newRgb.r, newRgb.g, newRgb.b);
    setHsl(newHsl);
  }, []);

  const handleEyeDropper = useCallback(async () => {
    if (typeof EyeDropper === "undefined") {
      await app.sendLog({ level: "warning", data: "EyeDropper API not available in this browser" });
      return;
    }
    try {
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      const newRgb = hexToRgb(result.sRGBHex);
      const newHsl = rgbToHsl(newRgb.r, newRgb.g, newRgb.b);
      setHsl(newHsl);
    } catch (e) {
      console.error("EyeDropper error:", e);
    }
  }, [app]);

  const handleConfirm = useCallback(async () => {
    // Add to recent colours
    setRecentColours((prev) => {
      const filtered = prev.filter((c) => c !== hex);
      return [hex, ...filtered].slice(0, 8);
    });

    // Update model context with selected colour
    await app.updateModelContext({
      content: [
        {
          type: "text",
          text: `Selected colour: ${hex} | RGB(${rgb.r}, ${rgb.g}, ${rgb.b}) | HSL(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)`,
        },
      ],
      structuredContent: {
        hex,
        rgb: { r: rgb.r, g: rgb.g, b: rgb.b },
        hsl: { h: hsl.h, s: hsl.s, l: hsl.l },
      },
    });

    await app.sendLog({ level: "info", data: `Colour selected: ${hex}` });
  }, [app, hex, rgb, hsl]);

  const eyeDropperAvailable = typeof EyeDropper !== "undefined";

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
      {/* Preview Swatch */}
      <div style={{ ...styles.preview, backgroundColor: hex }} title={hex} />

      {/* Hex Input */}
      <div style={styles.section}>
        <label style={styles.label}>Hex</label>
        <div style={styles.inputGroup}>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            style={styles.input}
            placeholder="#000000"
            maxLength={7}
          />
          {eyeDropperAvailable && (
            <button
              onClick={handleEyeDropper}
              style={{ ...styles.button, padding: "8px 12px" }}
              title="Pick colour from screen"
            >
              🎯
            </button>
          )}
        </div>
      </div>

      {/* HSL Sliders */}
      <div style={styles.section}>
        <label style={styles.label}>HSL</label>
        <div style={styles.inputGroup}>
          <span style={{ width: 20 }}>H</span>
          <input
            type="range"
            min="0"
            max="360"
            value={hsl.h}
            onChange={(e) => handleHslChange("h", parseInt(e.target.value))}
            style={{
              ...styles.slider,
              background: `linear-gradient(to right, 
                hsl(0, ${hsl.s}%, ${hsl.l}%), 
                hsl(60, ${hsl.s}%, ${hsl.l}%), 
                hsl(120, ${hsl.s}%, ${hsl.l}%), 
                hsl(180, ${hsl.s}%, ${hsl.l}%), 
                hsl(240, ${hsl.s}%, ${hsl.l}%), 
                hsl(300, ${hsl.s}%, ${hsl.l}%), 
                hsl(360, ${hsl.s}%, ${hsl.l}%))`,
            }}
          />
          <input
            type="number"
            min="0"
            max="360"
            value={hsl.h}
            onChange={(e) => handleHslChange("h", parseInt(e.target.value) || 0)}
            style={styles.numberInput}
          />
        </div>
        <div style={styles.inputGroup}>
          <span style={{ width: 20 }}>S</span>
          <input
            type="range"
            min="0"
            max="100"
            value={hsl.s}
            onChange={(e) => handleHslChange("s", parseInt(e.target.value))}
            style={{
              ...styles.slider,
              background: `linear-gradient(to right, 
                hsl(${hsl.h}, 0%, ${hsl.l}%), 
                hsl(${hsl.h}, 100%, ${hsl.l}%))`,
            }}
          />
          <input
            type="number"
            min="0"
            max="100"
            value={hsl.s}
            onChange={(e) => handleHslChange("s", parseInt(e.target.value) || 0)}
            style={styles.numberInput}
          />
        </div>
        <div style={styles.inputGroup}>
          <span style={{ width: 20 }}>L</span>
          <input
            type="range"
            min="0"
            max="100"
            value={hsl.l}
            onChange={(e) => handleHslChange("l", parseInt(e.target.value))}
            style={{
              ...styles.slider,
              background: `linear-gradient(to right, 
                hsl(${hsl.h}, ${hsl.s}%, 0%), 
                hsl(${hsl.h}, ${hsl.s}%, 50%), 
                hsl(${hsl.h}, ${hsl.s}%, 100%))`,
            }}
          />
          <input
            type="number"
            min="0"
            max="100"
            value={hsl.l}
            onChange={(e) => handleHslChange("l", parseInt(e.target.value) || 0)}
            style={styles.numberInput}
          />
        </div>
      </div>

      {/* RGB Inputs */}
      <div style={styles.section}>
        <label style={styles.label}>RGB</label>
        <div style={styles.inputGroup}>
          <span style={{ width: 20, color: "#ef4444" }}>R</span>
          <input
            type="range"
            min="0"
            max="255"
            value={rgb.r}
            onChange={(e) => handleRgbChange("r", parseInt(e.target.value))}
            style={{ ...styles.slider, background: `linear-gradient(to right, rgb(0,${rgb.g},${rgb.b}), rgb(255,${rgb.g},${rgb.b}))` }}
          />
          <input
            type="number"
            min="0"
            max="255"
            value={rgb.r}
            onChange={(e) => handleRgbChange("r", parseInt(e.target.value) || 0)}
            style={styles.numberInput}
          />
        </div>
        <div style={styles.inputGroup}>
          <span style={{ width: 20, color: "#22c55e" }}>G</span>
          <input
            type="range"
            min="0"
            max="255"
            value={rgb.g}
            onChange={(e) => handleRgbChange("g", parseInt(e.target.value))}
            style={{ ...styles.slider, background: `linear-gradient(to right, rgb(${rgb.r},0,${rgb.b}), rgb(${rgb.r},255,${rgb.b}))` }}
          />
          <input
            type="number"
            min="0"
            max="255"
            value={rgb.g}
            onChange={(e) => handleRgbChange("g", parseInt(e.target.value) || 0)}
            style={styles.numberInput}
          />
        </div>
        <div style={styles.inputGroup}>
          <span style={{ width: 20, color: "#3b82f6" }}>B</span>
          <input
            type="range"
            min="0"
            max="255"
            value={rgb.b}
            onChange={(e) => handleRgbChange("b", parseInt(e.target.value))}
            style={{ ...styles.slider, background: `linear-gradient(to right, rgb(${rgb.r},${rgb.g},0), rgb(${rgb.r},${rgb.g},255))` }}
          />
          <input
            type="number"
            min="0"
            max="255"
            value={rgb.b}
            onChange={(e) => handleRgbChange("b", parseInt(e.target.value) || 0)}
            style={styles.numberInput}
          />
        </div>
      </div>

      {/* Colour Palette */}
      <div style={styles.section}>
        <label style={styles.label}>Palette</label>
        <div style={styles.palette}>
          {DEFAULT_PALETTE.map((colour) => (
            <button
              key={colour}
              onClick={() => handlePaletteSelect(colour)}
              style={{
                ...styles.paletteColour,
                backgroundColor: colour,
                borderColor: colour === hex ? "var(--color-text-primary, #1a1a1a)" : "transparent",
              }}
              title={colour}
            />
          ))}
        </div>
      </div>

      {/* Recent Colours */}
      {recentColours.length > 0 && (
        <div style={styles.section}>
          <label style={styles.label}>Recent</label>
          <div style={{ ...styles.palette, gridTemplateColumns: "repeat(8, 1fr)" }}>
            {recentColours.map((colour) => (
              <button
                key={colour}
                onClick={() => handlePaletteSelect(colour)}
                style={{
                  ...styles.paletteColour,
                  backgroundColor: colour,
                  borderColor: colour === hex ? "var(--color-text-primary, #1a1a1a)" : "transparent",
                }}
                title={colour}
              />
            ))}
          </div>
        </div>
      )}

      {/* Output */}
      <div style={styles.outputSection}>
        <div><strong>Hex:</strong> {hex}</div>
        <div><strong>RGB:</strong> rgb({rgb.r}, {rgb.g}, {rgb.b})</div>
        <div><strong>HSL:</strong> hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</div>
      </div>

      {/* Confirm Button */}
      <button onClick={handleConfirm} style={styles.button}>
        ✓ Confirm Colour
      </button>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ColourPickerApp />
  </StrictMode>
);
