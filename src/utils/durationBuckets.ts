// Helper utilities for mapping duration ratio -> bucket, color, and label
export const BUCKET_LABELS = ['Fast', 'Normal', 'Medium', 'Slow', 'Very Slow'] as const;
export const BUCKET_COLORS = ['#93c5fd', '#86efac', '#fcd34d', '#fed7aa', '#fca5a5'];

// ratio expected in [0,1+] where 1 means maxDuration
export function ratioToBucket(ratio: number): number {
  if (ratio > 0.95) return 4;
  if (ratio > 0.8) return 3;
  if (ratio > 0.5) return 2;
  if (ratio > 0.2) return 1;
  return 0;
}

export function getBucketLabel(ratio: number): string {
  return BUCKET_LABELS[ratioToBucket(ratio)];
}

export function getBucketColor(ratio: number): string {
  return BUCKET_COLORS[ratioToBucket(ratio)];
}

export function getBucketByIndex(index: number) {
  return {
    label: BUCKET_LABELS[index] ?? 'Unknown',
    color: BUCKET_COLORS[index] ?? '#9ca3af',
  };
}
