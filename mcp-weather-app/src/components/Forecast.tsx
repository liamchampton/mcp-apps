import type { CSSProperties } from "react";

interface ForecastProps {
  forecast: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    condition: string;
    icon: string;
  }>;
  tempUnit: string;
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  title: {
    fontSize: "var(--font-text-sm-size, 14px)",
    fontWeight: "var(--font-weight-medium, 500)" as CSSProperties["fontWeight"],
    color: "var(--color-text-secondary, #666)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "4px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "8px",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    padding: "12px 8px",
    background: "var(--color-background-secondary, #f5f5f5)",
    borderRadius: "var(--border-radius-md, 8px)",
  },
  day: {
    fontSize: "var(--font-text-xs-size, 12px)",
    fontWeight: "var(--font-weight-medium, 500)" as CSSProperties["fontWeight"],
    color: "var(--color-text-secondary, #666)",
  },
  icon: {
    fontSize: "24px",
    lineHeight: 1,
  },
  temps: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },
  tempMax: {
    fontSize: "var(--font-text-sm-size, 14px)",
    fontWeight: "var(--font-weight-semibold, 600)" as CSSProperties["fontWeight"],
    color: "var(--color-text-primary, #1a1a1a)",
  },
  tempMin: {
    fontSize: "var(--font-text-xs-size, 12px)",
    color: "var(--color-text-secondary, #666)",
  },
};

function formatDay(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);
  
  if (targetDate.getTime() === today.getTime()) {
    return "Today";
  }
  if (targetDate.getTime() === tomorrow.getTime()) {
    return "Tmrw";
  }
  
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function Forecast({ forecast, tempUnit }: ForecastProps) {
  return (
    <div style={styles.container}>
      <div style={styles.title}>5-Day Forecast</div>
      <div style={styles.grid}>
        {forecast.map((day) => (
          <div key={day.date} style={styles.card}>
            <span style={styles.day}>{formatDay(day.date)}</span>
            <span style={styles.icon}>{day.icon}</span>
            <div style={styles.temps}>
              <span style={styles.tempMax}>{day.tempMax}{tempUnit}</span>
              <span style={styles.tempMin}>{day.tempMin}{tempUnit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
