import { useCallback, useEffect, useState } from "react";
import type { User, EmailRecipient } from "../types";
import { api, ApiError } from "../services/api";
import Header from "../components/Header";
import ComposeForm from "../components/ComposeForm";
import RecipientTable from "../components/RecipientTable";

type Tab = "compose" | "scheduled" | "sent";

const POLL_INTERVAL_MS = 5000;

export default function Dashboard({
  user,
  onLoggedOut,
}: {
  user: User;
  onLoggedOut: () => void;
}) {
  const [tab, setTab] = useState<Tab>("compose");

  const [scheduled, setScheduled] = useState<EmailRecipient[]>([]);
  const [scheduledLoading, setScheduledLoading] = useState(true);
  const [scheduledError, setScheduledError] = useState<string | null>(null);

  const [sent, setSent] = useState<EmailRecipient[]>([]);
  const [sentLoading, setSentLoading] = useState(true);
  const [sentError, setSentError] = useState<string | null>(null);

  const loadScheduled = useCallback(async () => {
    try {
      const rows = await api.scheduledEmails();
      setScheduled(rows);
      setScheduledError(null);
    } catch (err) {
      setScheduledError(
        err instanceof ApiError ? err.message : "Failed to load scheduled emails"
      );
    } finally {
      setScheduledLoading(false);
    }
  }, []);

  const loadSent = useCallback(async () => {
    try {
      const rows = await api.sentEmails();
      setSent(rows);
      setSentError(null);
    } catch (err) {
      setSentError(
        err instanceof ApiError ? err.message : "Failed to load sent emails"
      );
    } finally {
      setSentLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScheduled();
    loadSent();
    const id = setInterval(() => {
      loadScheduled();
      loadSent();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loadScheduled, loadSent]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "compose", label: "Compose" },
    { key: "scheduled", label: `Scheduled (${scheduled.length})` },
    { key: "sent", label: `Sent (${sent.length})` },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLoggedOut={onLoggedOut} />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`border-b-2 px-3 py-2 text-sm font-medium ${
                tab === t.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "compose" && (
          <ComposeForm
            onScheduled={() => {
              loadScheduled();
              setTab("scheduled");
            }}
          />
        )}

        {tab === "scheduled" && (
          <RecipientTable
            rows={scheduled}
            loading={scheduledLoading}
            error={scheduledError}
            emptyMessage="No scheduled emails yet. Compose one to get started."
            timeColumnLabel="Scheduled time"
            timeField="scheduledAt"
          />
        )}

        {tab === "sent" && (
          <RecipientTable
            rows={sent}
            loading={sentLoading}
            error={sentError}
            emptyMessage="No emails have been sent yet."
            timeColumnLabel="Sent time"
            timeField="sentAt"
            showPreviewLink
          />
        )}
      </main>
    </div>
  );
}
