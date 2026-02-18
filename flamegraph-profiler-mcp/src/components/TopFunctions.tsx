interface TopFunction {
  name: string;
  percentage: number;
  samples: number;
}

interface TopFunctionsProps {
  functions: TopFunction[];
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    border: "1px solid var(--color-border-primary, #e5e5e5)",
    borderRadius: "var(--border-radius-md, 8px)",
    overflow: "hidden",
  },
  header: {
    display: "grid",
    gridTemplateColumns: "1fr 100px 80px",
    gap: "12px",
    padding: "12px 16px",
    background: "var(--color-background-secondary, #f5f5f5)",
    fontWeight: "var(--font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
    fontSize: "var(--font-text-sm-size, 14px)",
    borderBottom: "1px solid var(--color-border-primary, #e5e5e5)",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 100px 80px",
    gap: "12px",
    padding: "10px 16px",
    borderBottom: "1px solid var(--color-border-primary, #e5e5e5)",
    fontSize: "var(--font-text-sm-size, 14px)",
  },
  rowLast: {
    borderBottom: "none",
  },
  funcName: {
    fontFamily: "var(--font-mono, monospace)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  percentage: {
    textAlign: "right",
  },
  samples: {
    textAlign: "right",
    color: "var(--color-text-secondary, #666)",
  },
  barContainer: {
    marginTop: "4px",
    height: "4px",
    background: "var(--color-background-secondary, #e5e5e5)",
    borderRadius: "2px",
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: "2px",
    transition: "width 0.3s ease",
  },
};

function getBarColor(percentage: number): string {
  if (percentage >= 30) return "#ef4444"; // Red - hot
  if (percentage >= 15) return "#f97316"; // Orange - warm
  if (percentage >= 5) return "#eab308"; // Yellow - moderate
  return "#22c55e"; // Green - cool
}

export function TopFunctions({ functions }: TopFunctionsProps) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span>Function</span>
        <span style={{ textAlign: "right" }}>CPU %</span>
        <span style={{ textAlign: "right" }}>Samples</span>
      </div>
      {functions.map((func, i) => (
        <div
          key={func.name}
          style={{
            ...styles.row,
            ...(i === functions.length - 1 ? styles.rowLast : {}),
          }}
        >
          <div>
            <div style={styles.funcName} title={func.name}>
              {func.name}
            </div>
            <div style={styles.barContainer}>
              <div
                style={{
                  ...styles.bar,
                  width: `${Math.min(func.percentage, 100)}%`,
                  background: getBarColor(func.percentage),
                }}
              />
            </div>
          </div>
          <span style={styles.percentage}>
            <strong>{func.percentage.toFixed(1)}%</strong>
          </span>
          <span style={styles.samples}>{func.samples}</span>
        </div>
      ))}
    </div>
  );
}
