// Simple in-memory sliding-window rate limiter (per process).
// Suitable for a single-instance deployment; swap for Redis when scaling out.

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0];
    buckets.set(key, bucket);
    return { ok: false, retryAfter: Math.ceil((oldest + windowMs - now) / 1000) };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);

  // Opportunistic cleanup
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (b.timestamps.every((t) => now - t > windowMs)) buckets.delete(k);
    }
  }
  return { ok: true, retryAfter: 0 };
}

/** Client identity: best-effort IP extraction behind proxies. */
export function clientKey(req: Request, scope: string): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  return `${scope}:${ip}`;
}
