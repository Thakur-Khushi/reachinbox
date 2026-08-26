import { useCallback, useEffect, useState } from "react";
import type { User, EmailRecipient } from "../types";
import { api, ApiError } from "../services/api";
import Sidebar, { type Tab } from "../components/Sidebar";
import ComposeForm from "../components/ComposeForm";
import RecipientTable from "../components/RecipientTable";
import StatCard from "../components/StatCard";
import { IconClock, IconCheckCircle, IconAlertTriangle } from "../components/icons";

const POLL_INTERVAL_MS = 5000;

const PAGE_COPY: Record<Tab, { title: string; subtitle: string }> = {
  compose: {
    title: "Compose a campaign",
    subtitle: "Upload recipients, set your sending rules, and schedule.",
  },
  scheduled: {
    title: "Scheduled emails",
    subtitle: "Waiting to be sent — this list refreshes automatically.",
  },
  sent: {
    title: "Sent emails",
    subtitle: "Completed and failed sends, with Ethereal preview links.",
  },
};

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

  const sentOk = sent.filter((r) => r.status === "SENT").length;
  const failed = sent.filter((r) => r.status === "FAILED").length;
  const { title, subtitle } = PAGE_COPY[tab];

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        tab={tab}
        onTabChange={setTab}
        scheduledCount={scheduled.length}
        sentCount={sent.length}
        user={user}
        onLoggedOut={onLoggedOut}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Scheduled" value={scheduled.length} icon={IconClock} accent="brand" />
            <StatCard label="Sent" value={sentOk} icon={IconCheckCircle} accent="emerald" />
            <StatCard label="Failed" value={failed} icon={IconAlertTriangle} accent="rose" />
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
              emptyAction={{ label: "Compose an email", onClick: () => setTab("compose") }}
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
        </div>
      </div>
    </div>
  );
}
