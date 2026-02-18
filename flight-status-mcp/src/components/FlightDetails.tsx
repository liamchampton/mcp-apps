import type { CSSProperties } from "react";

interface FlightDetailsProps {
  flight: {
    departure: {
      airport: string;
      terminal: string;
      gate: string;
    };
    arrival: {
      airport: string;
      terminal: string;
      gate: string;
    };
    aircraft: string;
    distance: string;
  };
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  section: {
    background: "var(--color-background-secondary, #f5f5f5)",
    borderRadius: "var(--border-radius-md, 8px)",
    padding: "16px",
  },
  sectionTitle: {
    fontSize: "var(--font-text-xs-size, 12px)",
    fontWeight: "var(--font-weight-medium, 500)" as CSSProperties["fontWeight"],
    color: "var(--color-text-secondary, #666)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "12px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  item: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  label: {
    fontSize: "var(--font-text-xs-size, 12px)",
    color: "var(--color-text-secondary, #666)",
  },
  value: {
    fontSize: "var(--font-text-base-size, 16px)",
    fontWeight: "var(--font-weight-semibold, 600)" as CSSProperties["fontWeight"],
    color: "var(--color-text-primary, #1a1a1a)",
  },
  airportName: {
    fontSize: "var(--font-text-sm-size, 14px)",
    color: "var(--color-text-primary, #1a1a1a)",
    marginBottom: "8px",
  },
  infoRow: {
    display: "flex",
    gap: "24px",
  },
};

export function FlightDetails({ flight }: FlightDetailsProps) {
  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>🛫 Departure</div>
        <div style={styles.airportName}>{flight.departure.airport}</div>
        <div style={styles.infoRow}>
          <div style={styles.item}>
            <span style={styles.label}>Terminal</span>
            <span style={styles.value}>{flight.departure.terminal}</span>
          </div>
          <div style={styles.item}>
            <span style={styles.label}>Gate</span>
            <span style={styles.value}>{flight.departure.gate}</span>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>🛬 Arrival</div>
        <div style={styles.airportName}>{flight.arrival.airport}</div>
        <div style={styles.infoRow}>
          <div style={styles.item}>
            <span style={styles.label}>Terminal</span>
            <span style={styles.value}>{flight.arrival.terminal}</span>
          </div>
          <div style={styles.item}>
            <span style={styles.label}>Gate</span>
            <span style={styles.value}>{flight.arrival.gate}</span>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>✈️ Aircraft Info</div>
        <div style={styles.grid}>
          <div style={styles.item}>
            <span style={styles.label}>Aircraft</span>
            <span style={styles.value}>{flight.aircraft}</span>
          </div>
          <div style={styles.item}>
            <span style={styles.label}>Distance</span>
            <span style={styles.value}>{flight.distance}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
