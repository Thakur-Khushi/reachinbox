export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string | null;
}

export type EmailStatus = "SCHEDULED" | "PROCESSING" | "SENT" | "FAILED";

export interface EmailRecipient {
  id: string;
  campaignId: string;
  recipient: string;
  subject: string;
  body: string;
  status: EmailStatus;
  scheduledAt: string;
  windowIndex: number;
  sentAt: string | null;
  previewUrl: string | null;
  error: string | null;
  createdAt: string;
}

export interface RecipientPreview {
  count: number;
  recipients: string[];
  invalidCount: number;
}

export interface CreateCampaignResponse {
  campaignId: string;
  scheduled: number;
  firstSendAt: string;
  lastSendAt: string;
}
