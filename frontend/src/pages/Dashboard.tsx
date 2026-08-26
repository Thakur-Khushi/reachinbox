import { useCallback, useEffect, useState } from "react";
import type { User, EmailRecipient } from "../types";
import { api, ApiError } from "../services/api";
import Sidebar, { type Tab } from "../components/Sidebar";
import ComposeForm from "../components/ComposeForm";
import EmailList from "../components/EmailList";
import EmailDetail from "../components/EmailDetail";

const POLL_INTERVAL_MS = 5000;

const PAGE_COPY: Record<Tab, { title: string; subtitle: string }> = {
  compose: {
    title: "Compose New Email",
    subtitle: "Upload recipients, set your sending rules, and schedule.",
  },
  scheduled: {
    title: "Scheduled",
    subtitle: "Waiting to be sent — this list refreshes automatically.",
  },
  sent: {
    title: "Sent",
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
  const [selected, setSelected] = useState<EmailRecipient | null>(null);

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

  function changeTab(next: Tab) {
    setSelected(null);
    setTab(next);
  }

  const { title, subtitle } = PAGE_COPY[tab];

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        tab={tab}
        onTabChange={changeTab}
        scheduledCount={scheduled.length}
        sentCount={sent.length}
        user={user}
        onLoggedOut={onLoggedOut}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>

          {tab === "compose" && (
            <ComposeForm
              user={user}
              onScheduled={() => {
                loadScheduled();
                changeTab("scheduled");
              }}
            />
          )}

          {tab === "scheduled" &&
            (selected ? (
              <EmailDetail email={selected} onBack={() => setSelected(null)} />
            ) : (
              <EmailList
                rows={scheduled}
                loading={scheduledLoading}
                error={scheduledError}
                emptyMessage="No scheduled emails yet. Compose one to get started."
                emptyAction={{ label: "Compose an email", onClick: () => changeTab("compose") }}
                onSelect={setSelected}
                onRefresh={loadScheduled}
              />
            ))}

          {tab === "sent" &&
            (selected ? (
              <EmailDetail email={selected} onBack={() => setSelected(null)} />
            ) : (
              <EmailList
                rows={sent}
                loading={sentLoading}
                error={sentError}
                emptyMessage="No emails have been sent yet."
                onSelect={setSelected}
                onRefresh={loadSent}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
