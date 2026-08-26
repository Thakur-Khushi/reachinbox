import type { User } from "../types";
import { api } from "../services/api";
import { IconMail, IconEdit, IconClock, IconCheckCircle, IconLogOut } from "./icons";

export type Tab = "compose" | "scheduled" | "sent";

interface Props {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  scheduledCount: number;
  sentCount: number;
  user: User;
  onLoggedOut: () => void;
}

const NAV: { key: Tab; label: string; icon: (p: { className?: string }) => JSX.Element }[] = [
  { key: "compose", label: "Compose", icon: IconEdit },
  { key: "scheduled", label: "Scheduled", icon: IconClock },
  { key: "sent", label: "Sent", icon: IconCheckCircle },
];

export default function Sidebar({
  tab,
  onTabChange,
  scheduledCount,
  sentCount,
  user,
  onLoggedOut,
}: Props) {
  async function handleLogout() {
    await api.logout();
    onLoggedOut();
  }

  const counts: Partial<Record<Tab, number>> = {
    scheduled: scheduledCount,
    sent: sentCount,
  };

  return (
    <aside className="flex h-screen w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-card">
          <IconMail className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-bold leading-tight text-slate-900">ReachInbox</div>
          <div className="text-xs leading-tight text-slate-400">Scheduler</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          const count = counts[key];
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon
                  className={`h-[18px] w-[18px] ${
                    active ? "text-brand-600" : "text-slate-400 group-hover:text-slate-500"
                  }`}
                />
                {label}
              </span>
              {count !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    active ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.name}
              className="h-9 w-9 flex-shrink-0 rounded-full ring-2 ring-white shadow-sm"
            />
          ) : (
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-slate-900">{user.name}</div>
            <div className="truncate text-xs text-slate-400">{user.email}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <IconLogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
