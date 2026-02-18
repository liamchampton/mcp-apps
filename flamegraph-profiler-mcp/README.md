# Flamegraph Profiler MCP App

An MCP App that profiles Go applications and generates interactive flamegraph visualizations to help identify performance bottlenecks.

## Features

- **CPU Profiling**: Analyze where your application spends CPU time
- **Memory Profiling**: Identify memory allocation hotspots
- **Interactive Flamegraph**: Visualize call stacks with zoom and hover details
- **Top Functions**: See the most expensive functions at a glance
- **Optimization Insights**: Get automated suggestions for improvements

## Usage

1. Start the MCP server:
   ```bash
   npm run start
   ```

2. Use the `profile-app` tool with:
   - `appPath`: Path to a Go source file (e.g., `./sample-app/main.go`)
   - `duration`: Profiling duration in seconds (default: 5)
   - `profileType`: Either `cpu` or `heap`

## Sample Application

Included is an intentionally inefficient Go application (`sample-app/main.go`) that demonstrates common performance anti-patterns:

- **Bubble Sort**: O(n²) sorting instead of O(n log n)
- **Recursive Fibonacci**: Exponential time complexity
- **Memory Waste**: Unnecessary allocations that trigger GC
- **String Concatenation**: Using `+` in loops instead of `strings.Builder`

This sample app is perfect for testing the profiler and seeing flamegraphs in action.

## Understanding Flamegraphs

- **Width** represents the amount of time/samples spent in a function
- **Stack depth** shows the call hierarchy (bottom = entry point, top = leaf functions)
- **Colors**:
  - 🔴 Orange/Red: Application code
  - 🔵 Blue: Go runtime functions
  - 🟣 Purple: System calls

## Development

```bash
# Install dependencies
npm install

# Build and run
npm run start

# Or run in development mode
npm run serve
```

## Requirements

- Node.js 18+
- Go 1.19+ (for profiling Go applications)
