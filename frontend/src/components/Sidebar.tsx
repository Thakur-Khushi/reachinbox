import { useRef, useState } from "react";
import type { User } from "../types";
import { api } from "../services/api";
import { useClickOutside } from "../lib/useClickOutside";
import { IconEdit, IconClock, IconSend, IconLogOut, IconChevronDown } from "./icons";
import Button from "./ui/Button";

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
  { key: "scheduled", label: "Scheduled", icon: IconClock },
  { key: "sent", label: "Sent", icon: IconSend },
];

export default function Sidebar({
  tab,
  onTabChange,
  scheduledCount,
  sentCount,
  user,
  onLoggedOut,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, menuOpen, () => setMenuOpen(false));

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
      <div className="px-5 pb-4 pt-6">
        <span className="text-xl font-extrabold tracking-tight text-slate-900">ReachInbox</span>
      </div>

      <div className="px-3 pb-4" ref={menuRef}>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-slate-50"
          >
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
            <IconChevronDown
              className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <IconLogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => onTabChange("compose")}
          className="mt-3 w-full"
        >
          <IconEdit className="h-4 w-4" />
          Compose
        </Button>
      </div>

      <div className="px-3">
        <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Core
        </div>
        <nav className="space-y-1">
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
      </div>
    </aside>
  );
}
