import { Request, Response } from "express";
import { parseRecipientsFile } from "../services/recipientParser";

export function previewRecipients(req: Request, res: Response) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const content = file.buffer.toString("utf-8");
  const result = parseRecipientsFile(content);
  return res.json(result);
}
