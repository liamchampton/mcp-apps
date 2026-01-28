import type { CSSProperties } from "react";

interface CurrentWeatherProps {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    icon: string;
  };
  tempUnit: string;
  windUnit: string;
}

const styles: Record<string, CSSProperties> = {
  container: {
    background: "var(--color-background-secondary, #f5f5f5)",
    borderRadius: "var(--border-radius-lg, 12px)",
    padding: "20px",
    textAlign: "center",
  },
  iconRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "8px",
  },
  icon: {
    fontSize: "48px",
    lineHeight: 1,
  },
  temperature: {
    fontSize: "48px",
    fontWeight: "var(--font-weight-bold, 700)" as CSSProperties["fontWeight"],
    color: "var(--color-text-primary, #1a1a1a)",
    lineHeight: 1,
  },
  condition: {
    fontSize: "var(--font-text-lg-size, 18px)",
    color: "var(--color-text-primary, #1a1a1a)",
    marginBottom: "16px",
  },
  feelsLike: {
    fontSize: "var(--font-text-sm-size, 14px)",
    color: "var(--color-text-secondary, #666)",
    marginBottom: "16px",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  detailItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "12px",
    background: "var(--color-background-primary, #ffffff)",
    borderRadius: "var(--border-radius-md, 8px)",
  },
  detailIcon: {
    fontSize: "20px",
  },
  detailValue: {
    fontSize: "var(--font-text-base-size, 16px)",
    fontWeight: "var(--font-weight-semibold, 600)" as CSSProperties["fontWeight"],
    color: "var(--color-text-primary, #1a1a1a)",
  },
  detailLabel: {
    fontSize: "var(--font-text-xs-size, 12px)",
    color: "var(--color-text-secondary, #666)",
  },
};

export function CurrentWeather({ current, tempUnit, windUnit }: CurrentWeatherProps) {
  return (
    <div style={styles.container}>
      <div style={styles.iconRow}>
        <span style={styles.icon}>{current.icon}</span>
        <span style={styles.temperature}>{current.temperature}{tempUnit}</span>
      </div>
      
      <div style={styles.condition}>{current.condition}</div>
      
      <div style={styles.feelsLike}>
        Feels like {current.feelsLike}{tempUnit}
      </div>
      
      <div style={styles.detailsGrid}>
        <div style={styles.detailItem}>
          <span style={styles.detailIcon}>💧</span>
          <span style={styles.detailValue}>{current.humidity}%</span>
          <span style={styles.detailLabel}>Humidity</span>
        </div>
        <div style={styles.detailItem}>
          <span style={styles.detailIcon}>💨</span>
          <span style={styles.detailValue}>{current.windSpeed} {windUnit}</span>
          <span style={styles.detailLabel}>Wind</span>
        </div>
      </div>
    </div>
  );
}
