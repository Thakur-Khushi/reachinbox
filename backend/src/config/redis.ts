import IORedis from "ioredis";
import { env } from "./env";

export function createRedisConnection() {
  return new IORedis({
    host: env.redisHost,
    port: env.redisPort,
    maxRetriesPerRequest: null,
  });
}

export const redis = createRedisConnection();
