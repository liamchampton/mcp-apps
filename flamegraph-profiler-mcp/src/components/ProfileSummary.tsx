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

interface ProfileSummaryProps {
  profile: ProfileData;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  card: {
    border: "1px solid var(--color-border-primary, #e5e5e5)",
    borderRadius: "var(--border-radius-md, 8px)",
    padding: "16px",
    background: "var(--color-background-primary, #ffffff)",
  },
  cardTitle: {
    fontSize: "var(--font-text-base-size, 16px)",
    fontWeight: "var(--font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
    margin: "0 0 12px 0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
  },
  stat: {
    textAlign: "center",
    padding: "12px",
    background: "var(--color-background-secondary, #f5f5f5)",
    borderRadius: "var(--border-radius-md, 8px)",
  },
  statValue: {
    fontSize: "var(--font-heading-lg-size, 24px)",
    fontWeight: "var(--font-weight-bold, 700)" as React.CSSProperties["fontWeight"],
    color: "var(--color-text-primary, #1a1a1a)",
  },
  statLabel: {
    fontSize: "var(--font-text-sm-size, 14px)",
    color: "var(--color-text-secondary, #666)",
    marginTop: "4px",
  },
  insightsList: {
    margin: 0,
    padding: "0 0 0 20px",
  },
  insightItem: {
    marginBottom: "8px",
    fontSize: "var(--font-text-sm-size, 14px)",
    lineHeight: 1.5,
  },
  rawProfile: {
    fontFamily: "var(--font-mono, monospace)",
    fontSize: "11px",
    background: "var(--color-background-secondary, #1a1a1a)",
    color: "var(--color-text-primary, #f5f5f5)",
    padding: "12px",
    borderRadius: "var(--border-radius-md, 8px)",
    overflow: "auto",
    maxHeight: "200px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
  },
};

function generateInsights(profile: ProfileData): string[] {
  const insights: string[] = [];
  const topFunc = profile.topFunctions[0];

  if (topFunc && topFunc.percentage > 30) {
    insights.push(
      `⚠️ ${topFunc.name} is consuming ${topFunc.percentage.toFixed(1)}% of CPU time - this is a major hotspot!`
    );
  }

  const runtimeFuncs = profile.topFunctions.filter((f) =>
    f.name.startsWith("runtime.")
  );
  const runtimePercentage = runtimeFuncs.reduce((sum, f) => sum + f.percentage, 0);
  if (runtimePercentage > 20) {
    insights.push(
      `🔄 Runtime functions account for ${runtimePercentage.toFixed(1)}% - consider reducing allocations or GC pressure.`
    );
  }

  const sortFuncs = profile.topFunctions.filter((f) =>
    f.name.toLowerCase().includes("sort")
  );
  if (sortFuncs.length > 0) {
    insights.push(
      `📊 Sorting operations detected (${sortFuncs.map((f) => f.name).join(", ")}) - verify optimal algorithm is used.`
    );
  }

  const allocFuncs = profile.topFunctions.filter(
    (f) => f.name.includes("malloc") || f.name.includes("growslice")
  );
  if (allocFuncs.length > 0) {
    insights.push(
      `💾 Memory allocation functions are hot - pre-allocate slices and reuse buffers where possible.`
    );
  }

  if (profile.topFunctions.some((f) => f.name.includes("fibonacci"))) {
    insights.push(
      `🔢 Recursive fibonacci detected - consider memoization or iterative implementation.`
    );
  }

  if (insights.length === 0) {
    insights.push(`✅ Profile looks healthy - no major hotspots detected.`);
  }

  return insights;
}

export function ProfileSummary({ profile }: ProfileSummaryProps) {
  const insights = generateInsights(profile);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>📈 Profile Statistics</h3>
        <div style={styles.statsGrid}>
          <div style={styles.stat}>
            <div style={styles.statValue}>{profile.duration.toFixed(2)}s</div>
            <div style={styles.statLabel}>Duration</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statValue}>{profile.sampleCount.toLocaleString()}</div>
            <div style={styles.statLabel}>Samples</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statValue}>{profile.topFunctions.length}</div>
            <div style={styles.statLabel}>Functions Profiled</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statValue}>
              {profile.topFunctions[0]?.percentage.toFixed(1) ?? 0}%
            </div>
            <div style={styles.statLabel}>Top Function CPU</div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>💡 Optimization Insights</h3>
        <ul style={styles.insightsList}>
          {insights.map((insight, i) => (
            <li key={i} style={styles.insightItem}>
              {insight}
            </li>
          ))}
        </ul>
      </div>

      {profile.rawProfile && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📄 Raw Profile Data</h3>
          <pre style={styles.rawProfile}>{profile.rawProfile}</pre>
        </div>
      )}
    </div>
  );
}
