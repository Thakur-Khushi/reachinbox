import { Queue } from "bullmq";
import { createRedisConnection } from "../config/redis";

export const EMAIL_QUEUE_NAME = "email-queue";

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 1000,
    removeOnFail: 1000,
  },
});

export interface EmailJobData {
  recipientId: string;
}

export async function enqueueEmailJob(
  recipientId: string,
  scheduledAt: Date
) {
  const delay = Math.max(0, scheduledAt.getTime() - Date.now());
  await emailQueue.add(
    "send-email",
    { recipientId } as EmailJobData,
    {
      jobId: recipientId,
      delay,
    }
  );
}
