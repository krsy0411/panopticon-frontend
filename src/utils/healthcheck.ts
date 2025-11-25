/**
 * Health check utilities for services
 */

export function isErrorHealthy(errorRate: number): boolean {
  const percent = errorRate * 100;
  return percent < 1; // 1% 미만이면 healthy
}

export function isLatencyHealthy(latencyMs: number): boolean {
  return latencyMs < 400; // 400ms 미만이면 healthy
}

export function formatLatency(latencyMs: number): string {
  if (latencyMs >= 1000) {
    return `${(latencyMs / 1000).toFixed(2)}s`;
  }
  return `${Math.round(latencyMs)}ms`;
}
