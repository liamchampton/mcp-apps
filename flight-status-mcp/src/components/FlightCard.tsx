import type { CSSProperties } from "react";

interface FlightCardProps {
  flight: {
    flightNumber: string;
    airline: string;
    status: string;
    statusIcon: string;
    departure: {
      airportCode: string;
      scheduledTime: string;
      estimatedTime: string;
    };
    arrival: {
      airportCode: string;
      scheduledTime: string;
      estimatedTime: string;
    };
    duration: string;
  };
}

const styles: Record<string, CSSProperties> = {
  container: {
    background: "var(--color-background-secondary, #f5f5f5)",
    borderRadius: "var(--border-radius-lg, 12px)",
    padding: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  flightInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  flightNumber: {
    fontSize: "var(--font-heading-lg-size, 24px)",
    fontWeight: "var(--font-weight-bold, 700)" as CSSProperties["fontWeight"],
    color: "var(--color-text-primary, #1a1a1a)",
  },
  airline: {
    fontSize: "var(--font-text-sm-size, 14px)",
    color: "var(--color-text-secondary, #666)",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "var(--border-radius-md, 8px)",
    fontSize: "var(--font-text-sm-size, 14px)",
    fontWeight: "var(--font-weight-medium, 500)" as CSSProperties["fontWeight"],
  },
  route: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  airport: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    flex: 1,
  },
  airportCode: {
    fontSize: "32px",
    fontWeight: "var(--font-weight-bold, 700)" as CSSProperties["fontWeight"],
    color: "var(--color-text-primary, #1a1a1a)",
  },
  time: {
    fontSize: "var(--font-text-base-size, 16px)",
    fontWeight: "var(--font-weight-semibold, 600)" as CSSProperties["fontWeight"],
    color: "var(--color-text-primary, #1a1a1a)",
  },
  scheduledTime: {
    fontSize: "var(--font-text-xs-size, 12px)",
    color: "var(--color-text-secondary, #666)",
    textDecoration: "line-through",
  },
  flightPath: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    flex: 1,
  },
  pathLine: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
  },
  line: {
    flex: 1,
    height: "2px",
    background: "var(--color-border-primary, #e5e5e5)",
  },
  planeIcon: {
    fontSize: "20px",
  },
  duration: {
    fontSize: "var(--font-text-xs-size, 12px)",
    color: "var(--color-text-secondary, #666)",
  },
};

function getStatusStyle(status: string): CSSProperties {
  switch (status) {
    case "On Time":
      return { background: "#dcfce7", color: "#166534" };
    case "Delayed":
      return { background: "#fef3c7", color: "#92400e" };
    case "Cancelled":
      return { background: "#fee2e2", color: "#991b1b" };
    case "Boarding":
      return { background: "#dbeafe", color: "#1e40af" };
    case "In Air":
      return { background: "#e0e7ff", color: "#3730a3" };
    case "Landed":
      return { background: "#d1fae5", color: "#065f46" };
    default:
      return { background: "#f3f4f6", color: "#374151" };
  }
}

export function FlightCard({ flight }: FlightCardProps) {
  const isDelayed = flight.departure.scheduledTime !== flight.departure.estimatedTime;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.flightInfo}>
          <span style={styles.flightNumber}>{flight.flightNumber}</span>
          <span style={styles.airline}>{flight.airline}</span>
        </div>
        <div style={{ ...styles.statusBadge, ...getStatusStyle(flight.status) }}>
          <span>{flight.statusIcon}</span>
          <span>{flight.status}</span>
        </div>
      </div>

      <div style={styles.route}>
        <div style={styles.airport}>
          <span style={styles.airportCode}>{flight.departure.airportCode}</span>
          <span style={styles.time}>{flight.departure.estimatedTime}</span>
          {isDelayed && (
            <span style={styles.scheduledTime}>{flight.departure.scheduledTime}</span>
          )}
        </div>

        <div style={styles.flightPath}>
          <div style={styles.pathLine}>
            <div style={styles.line} />
            <span style={styles.planeIcon}>✈️</span>
            <div style={styles.line} />
          </div>
          <span style={styles.duration}>{flight.duration}</span>
        </div>

        <div style={styles.airport}>
          <span style={styles.airportCode}>{flight.arrival.airportCode}</span>
          <span style={styles.time}>{flight.arrival.estimatedTime}</span>
          {flight.arrival.scheduledTime !== flight.arrival.estimatedTime && (
            <span style={styles.scheduledTime}>{flight.arrival.scheduledTime}</span>
          )}
        </div>
      </div>
    </div>
  );
}
