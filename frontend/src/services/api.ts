import type {
  User,
  EmailRecipient,
  RecipientPreview,
  CreateCampaignResponse,
} from "../types";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data.error ?? message;
    } catch {
      // response had no JSON body
    }
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  googleLoginUrl: () => `${API_URL}/auth/google`,

  me: () => request<User>("/auth/me"),

  logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),

  previewRecipients: async (file: File): Promise<RecipientPreview> => {
    const formData = new FormData();
    formData.append("file", file);
    return request<RecipientPreview>("/api/recipients/preview", {
      method: "POST",
      body: formData,
    });
  },

  createCampaign: (payload: {
    subject: string;
    body: string;
    recipients: string[];
    startTime: string;
    delayMs: number;
    hourlyLimit: number;
  }) =>
    request<CreateCampaignResponse>("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  scheduledEmails: () => request<EmailRecipient[]>("/api/emails/scheduled"),

  sentEmails: () => request<EmailRecipient[]>("/api/emails/sent"),
};

export { ApiError };
