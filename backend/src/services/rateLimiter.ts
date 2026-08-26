import { redis } from "../config/redis";

const WINDOW_TTL_SECONDS = 2 * 60 * 60; // 2h, comfortably longer than one window

function rateKey(campaignId: string, windowIndex: number): string {
  return `rate:${campaignId}:${windowIndex}`;
}

function deferKey(campaignId: string, windowIndex: number): string {
  return `defer:${campaignId}:${windowIndex}`;
}

/**
 * Atomically reserves one send slot for (campaignId, windowIndex) using a
 * Redis counter as the single source of truth — safe across multiple
 * worker processes/instances, unlike an in-memory JS counter.
 */
export async function tryReserveSlot(
  campaignId: string,
  windowIndex: number,
  hourlyLimit: number
): Promise<boolean> {
  const key = rateKey(campaignId, windowIndex);
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_TTL_SECONDS);
  }
  if (count > hourlyLimit) {
    await redis.decr(key);
    return false;
  }
  return true;
}

/**
 * Returns this recipient's 0-based position among everyone deferred into
 * (campaignId, windowIndex) so far, so overflow emails can still be spaced
 * out by delayMs instead of all landing on the exact same instant.
 */
export async function nextDeferPosition(
  campaignId: string,
  windowIndex: number
): Promise<number> {
  const key = deferKey(campaignId, windowIndex);
  const position = await redis.incr(key);
  if (position === 1) {
    await redis.expire(key, WINDOW_TTL_SECONDS);
  }
  return position - 1;
}
