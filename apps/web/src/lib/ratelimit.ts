const windows = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_ATTEMPTS = 5;

export class RateLimitError extends Error {
  public statusCode = 429;
  constructor() {
    super("Rate limit exceeded. Try again in 1 minute.");
    this.name = "RateLimitError";
  }
}

export function verifyRateLimit(
  userId: string,
  workspaceId: string
): void {
  const key = `${workspaceId}:${userId}`;
  const now = Date.now();

  const window = windows.get(key);

  if (!window || now > window.resetAt) {
    windows.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  window.count += 1;
  if (window.count > MAX_ATTEMPTS) {
    throw new RateLimitError();
  }
}
