import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { assignSendSlots } from "../services/scheduler";
import { enqueueEmailJob } from "../queues/emailQueue";

interface CreateCampaignBody {
  subject: string;
  body: string;
  recipients: string[];
  startTime: string;
  delayMs: number;
  hourlyLimit: number;
}

export async function createCampaign(req: Request, res: Response) {
  const user = req.user as any;
  const { subject, body, recipients, startTime, delayMs, hourlyLimit } =
    req.body as CreateCampaignBody;

  if (!subject || !body) {
    return res.status(400).json({ error: "Subject and body are required" });
  }
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: "At least one recipient is required" });
  }
  const start = new Date(startTime);
  if (isNaN(start.getTime())) {
    return res.status(400).json({ error: "Invalid startTime" });
  }
  const delay = Number(delayMs);
  const limit = Number(hourlyLimit);
  if (!Number.isFinite(delay) || delay < 0) {
    return res.status(400).json({ error: "Invalid delayMs" });
  }
  if (!Number.isFinite(limit) || limit <= 0) {
    return res.status(400).json({ error: "Invalid hourlyLimit" });
  }

  const slots = assignSendSlots(recipients.length, start, delay, limit);

  const campaign = await prisma.campaign.create({
    data: {
      userId: user.id,
      subject,
      body,
      startTime: start,
      delayMs: delay,
      hourlyLimit: limit,
    },
  });

  const rows = await prisma.$transaction(
    recipients.map((recipient, i) =>
      prisma.emailRecipient.create({
        data: {
          campaignId: campaign.id,
          userId: user.id,
          recipient,
          subject,
          body,
          scheduledAt: slots[i].scheduledAt,
          windowIndex: slots[i].windowIndex,
        },
      })
    )
  );

  await Promise.all(
    rows.map((row) => enqueueEmailJob(row.id, row.scheduledAt))
  );

  return res.status(201).json({
    campaignId: campaign.id,
    scheduled: rows.length,
    firstSendAt: slots[0]?.scheduledAt,
    lastSendAt: slots[slots.length - 1]?.scheduledAt,
  });
}
