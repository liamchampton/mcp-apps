import { useState, useCallback, useMemo } from "react";

interface ProfileFrame {
  name: string;
  value: number;
  children?: ProfileFrame[];
}

interface FlamegraphProps {
  data: ProfileFrame;
}

// Generate consistent colors based on function name
function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Create warm flame colors (reds, oranges, yellows)
  const hue = 10 + (Math.abs(hash) % 40); // 10-50 range (red to orange-yellow)
  const saturation = 70 + (Math.abs(hash >> 8) % 20); // 70-90%
  const lightness = 45 + (Math.abs(hash >> 16) % 15); // 45-60%

  // Special colors for runtime/system functions
  if (name.startsWith("runtime.")) {
    return `hsl(200, 60%, 55%)`; // Blue for runtime
  }
  if (name.startsWith("syscall.") || name.startsWith("os.")) {
    return `hsl(280, 50%, 55%)`; // Purple for syscalls
  }

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Flatten the tree to rows for rendering
interface FlatFrame {
  frame: ProfileFrame;
  depth: number;
  x: number; // 0-1 range
  width: number; // 0-1 range
}

function flattenFrames(root: ProfileFrame): FlatFrame[] {
  const result: FlatFrame[] = [];

  function traverse(frame: ProfileFrame, depth: number, x: number, parentWidth: number) {
    result.push({ frame, depth, x, width: parentWidth });

    if (frame.children) {
      let childX = x;
      const totalChildValue = frame.children.reduce((sum, c) => sum + c.value, 0);
      for (const child of frame.children) {
        const childWidth = parentWidth * (child.value / (totalChildValue || 1));
        traverse(child, depth + 1, childX, childWidth);
        childX += childWidth;
      }
    }
  }

  traverse(root, 0, 0, 1);
  return result;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    overflowX: "auto",
    border: "1px solid var(--color-border-primary, #e5e5e5)",
    borderRadius: "var(--border-radius-md, 8px)",
    background: "var(--color-background-secondary, #f5f5f5)",
  },
  svg: {
    display: "block",
    minWidth: "600px",
  },
  tooltip: {
    position: "fixed",
    padding: "8px 12px",
    background: "rgba(0, 0, 0, 0.9)",
    color: "#fff",
    borderRadius: "6px",
    fontSize: "12px",
    pointerEvents: "none",
    zIndex: 1000,
    maxWidth: "400px",
    wordBreak: "break-all",
  },
  legend: {
    display: "flex",
    gap: "16px",
    padding: "8px 12px",
    fontSize: "12px",
    color: "var(--color-text-secondary, #666)",
    borderTop: "1px solid var(--color-border-primary, #e5e5e5)",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  legendColor: {
    width: "12px",
    height: "12px",
    borderRadius: "2px",
  },
};

export function Flamegraph({ data }: FlamegraphProps) {
  const [hoveredFrame, setHoveredFrame] = useState<FlatFrame | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const flatFrames = useMemo(() => flattenFrames(data), [data]);
  const maxDepth = useMemo(
    () => Math.max(...flatFrames.map((f) => f.depth)) + 1,
    [flatFrames]
  );

  const frameHeight = 16;
  const padding = 2;
  const svgHeight = maxDepth * (frameHeight + padding) + padding;
  const svgWidth = 600;

  const handleMouseMove = useCallback((e: React.MouseEvent, frame: FlatFrame) => {
    setHoveredFrame(frame);
    setTooltipPos({ x: e.clientX + 10, y: e.clientY + 10 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredFrame(null);
  }, []);

  return (
    <div style={styles.container}>
      <svg
        style={styles.svg}
        width="100%"
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMinYMin meet"
      >
        {flatFrames.map((flatFrame, i) => {
          const { frame, depth, x, width } = flatFrame;
          const rectX = x * (svgWidth - 2 * padding) + padding;
          const rectY = (maxDepth - 1 - depth) * (frameHeight + padding) + padding;
          const rectWidth = Math.max(width * (svgWidth - 2 * padding) - 1, 1);
          const color = getColorForName(frame.name);
          const isHovered = hoveredFrame === flatFrame;

          // Truncate name to fit
          const maxChars = Math.floor(rectWidth / 5);
          const displayName = frame.name.length > maxChars
            ? frame.name.substring(0, maxChars - 2) + "…"
            : frame.name;

          return (
            <g
              key={`${frame.name}-${depth}-${i}`}
              onMouseMove={(e) => handleMouseMove(e, flatFrame)}
              onMouseLeave={handleMouseLeave}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={rectX}
                y={rectY}
                width={rectWidth}
                height={frameHeight}
                fill={color}
                stroke={isHovered ? "#000" : "rgba(0,0,0,0.1)"}
                strokeWidth={isHovered ? 2 : 1}
                rx={2}
              />
              {rectWidth > 30 && (
                <text
                  x={rectX + 3}
                  y={rectY + frameHeight / 2 + 3}
                  fontSize="9"
                  fill="#fff"
                  style={{ pointerEvents: "none", textShadow: "0 1px 1px rgba(0,0,0,0.5)" }}
                >
                  {displayName}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {hoveredFrame && (
        <div style={{ ...styles.tooltip, left: tooltipPos.x, top: tooltipPos.y }}>
          <strong>{hoveredFrame.frame.name}</strong>
          <br />
          Samples: {hoveredFrame.frame.value}
          <br />
          {((hoveredFrame.frame.value / data.value) * 100).toFixed(2)}% of total
        </div>
      )}

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendColor, background: "hsl(25, 80%, 50%)" }} />
          <span>Application Code</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendColor, background: "hsl(200, 60%, 55%)" }} />
          <span>Runtime</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendColor, background: "hsl(280, 50%, 55%)" }} />
          <span>System Calls</span>
        </div>
      </div>
    </div>
  );
}
