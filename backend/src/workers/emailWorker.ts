import { Job, Worker } from "bullmq";
import { createRedisConnection } from "../config/redis";
import { env } from "../config/env";
import { prisma } from "../database/prisma";
import { EMAIL_QUEUE_NAME, EmailJobData, emailQueue } from "../queues/emailQueue";
import { tryReserveSlot, nextDeferPosition } from "../services/rateLimiter";
import { sendEmail } from "../services/mailer";
import { HOUR_MS } from "../services/scheduler";

async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const { recipientId } = job.data;

  const recipient = await prisma.emailRecipient.findUnique({
    where: { id: recipientId },
    include: { campaign: true },
  });
  if (!recipient) {
    console.warn(`[worker] Recipient ${recipientId} no longer exists, skipping`);
    return;
  }

  // Atomic claim: only proceed if this row is still SCHEDULED. Covers
  // idempotency (already SENT/FAILED) and concurrent-worker duplication
  // (already PROCESSING) in one compare-and-swap.
  const claim = await prisma.emailRecipient.updateMany({
    where: { id: recipientId, status: "SCHEDULED" },
    data: { status: "PROCESSING" },
  });
  if (claim.count === 0) {
    console.log(`[worker] ${recipientId} already handled, skipping duplicate job`);
    return;
  }

  // Hourly rate limit enforced against Redis (shared across every worker
  // process), not an in-memory counter.
  const reserved = await tryReserveSlot(
    recipient.campaignId,
    recipient.windowIndex,
    recipient.campaign.hourlyLimit
  );

  if (!reserved) {
    const newWindowIndex = recipient.windowIndex + 1;
    const windowStart =
      recipient.campaign.startTime.getTime() + newWindowIndex * HOUR_MS;
    const position = await nextDeferPosition(recipient.campaignId, newWindowIndex);
    const newScheduledAt = new Date(
      windowStart + position * recipient.campaign.delayMs
    );

    await prisma.emailRecipient.update({
      where: { id: recipientId },
      data: {
        status: "SCHEDULED",
        scheduledAt: newScheduledAt,
        windowIndex: newWindowIndex,
      },
    });

    await emailQueue.add(
      "send-email",
      { recipientId } as EmailJobData,
      {
        jobId: `${recipientId}:w${newWindowIndex}`,
        delay: Math.max(0, newScheduledAt.getTime() - Date.now()),
      }
    );

    console.log(
      `[worker] Hourly limit reached for campaign ${recipient.campaignId}, deferred ${recipientId} to window ${newWindowIndex}`
    );
    return;
  }

  try {
    const { previewUrl } = await sendEmail(
      recipient.recipient,
      recipient.subject,
      recipient.body
    );

    await prisma.emailRecipient.update({
      where: { id: recipientId },
      data: { status: "SENT", sentAt: new Date(), previewUrl },
    });

    console.log(`[worker] Sent to ${recipient.recipient} (${previewUrl})`);
  } catch (err) {
    const attempts = job.opts.attempts ?? 1;
    const isFinalAttempt = job.attemptsMade + 1 >= attempts;

    if (isFinalAttempt) {
      await prisma.emailRecipient.update({
        where: { id: recipientId },
        data: { status: "FAILED", error: (err as Error).message },
      });
    } else {
      // Revert the claim so the retry's compare-and-swap can succeed again.
      await prisma.emailRecipient.update({
        where: { id: recipientId },
        data: { status: "SCHEDULED" },
      });
    }
    throw err;
  }
}

const worker = new Worker<EmailJobData>(EMAIL_QUEUE_NAME, processEmailJob, {
  connection: createRedisConnection(),
  concurrency: env.workerConcurrency,
});

worker.on("failed", (job, err) => {
  console.error(`[worker] Job ${job?.id} failed:`, err.message);
});

worker.on("ready", () => {
  console.log(
    `[worker] Listening on "${EMAIL_QUEUE_NAME}" with concurrency=${env.workerConcurrency}`
  );
});

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
process.on("SIGINT", async () => {
  await worker.close();
  process.exit(0);
});
