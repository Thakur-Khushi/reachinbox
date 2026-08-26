import { Request, Response } from "express";
import { prisma } from "../database/prisma";

export async function listScheduled(req: Request, res: Response) {
  const user = req.user as any;
  const rows = await prisma.emailRecipient.findMany({
    where: { userId: user.id, status: { in: ["SCHEDULED", "PROCESSING"] } },
    orderBy: { scheduledAt: "asc" },
    take: 500,
  });
  res.json(rows);
}

export async function listSent(req: Request, res: Response) {
  const user = req.user as any;
  const rows = await prisma.emailRecipient.findMany({
    where: { userId: user.id, status: { in: ["SENT", "FAILED"] } },
    orderBy: [{ sentAt: "desc" }, { createdAt: "desc" }],
    take: 500,
  });
  res.json(rows);
}
