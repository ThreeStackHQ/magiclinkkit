import Redis from "ioredis";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error("REDIS_URL environment variable is not set");
    redis = new Redis(url);
  }
  return redis;
}

export class RateLimitError extends Error {
  public statusCode = 429;
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

async function slidingWindowCheck(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<void> {
  const r = getRedis();
  const now = Date.now();
  const windowStart = now - windowMs;

  const pipeline = r.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart);
  pipeline.zadd(key, now.toString(), `${now}:${Math.random()}`);
  pipeline.zcard(key);
  pipeline.pexpire(key, windowMs);
  const results = await pipeline.exec();

  const count = results?.[2]?.[1] as number;
  if (count > maxRequests) {
    throw new RateLimitError(
      `Rate limit exceeded. Max ${maxRequests} requests per ${Math.round(windowMs / 60000)} minutes.`
    );
  }
}

export async function rateLimitMagicLink(
  email: string,
  workspaceId: string
): Promise<void> {
  const key = `rl:magic:${workspaceId}:${email}`;
  await slidingWindowCheck(key, 5, 15 * 60 * 1000);
}

export async function rateLimitOtp(
  email: string,
  workspaceId: string
): Promise<void> {
  const key = `rl:otp:${workspaceId}:${email}`;
  await slidingWindowCheck(key, 3, 10 * 60 * 1000);
}
