export function roundTo15Min(date: Date) {
  const ms = 15 * 60 * 1000;
  return new Date(Math.floor(date.getTime() / ms) * ms).toISOString();
}

export function quantiles(arr: number[], q: number[]) {
  if (!arr.length) return q.map(() => null);
  const sorted = [...arr].sort((a, b) => a - b);
  return q.map(p => {
    const pos = (sorted.length - 1) * p;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    return sorted[base];
  });
}

export function mean(arr: number[]) {
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function stddev(arr: number[]) {
  if (!arr.length) return null;
  const m = mean(arr)!;
  return Math.sqrt(arr.reduce((acc, v) => acc + (v - m) ** 2, 0) / arr.length);
}
