import { useState } from "react";
import type { EmailRecipient } from "../types";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import { IconAlertTriangle, IconSpinner, IconSearch, IconRefresh, IconStar } from "./icons";

function preview(body: string, max = 60): string {
  const clean = body.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
}

interface Props {
  rows: EmailRecipient[];
  loading: boolean;
  error: string | null;
  emptyMessage: string;
  emptyAction?: { label: string; onClick: () => void };
  onSelect: (row: EmailRecipient) => void;
  onRefresh: () => void;
}

export default function EmailList({
  rows,
  loading,
  error,
  emptyMessage,
  emptyAction,
  onSelect,
  onRefresh,
}: Props) {
  const [query, setQuery] = useState("");

  const visible = query.trim()
    ? rows.filter((r) => {
        const q = query.toLowerCase();
        return r.recipient.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q);
      })
    : rows;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <div className="relative flex-1">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by recipient or subject"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <button
          type="button"
          onClick={onRefresh}
          title="Refresh"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <IconRefresh className="h-[18px] w-[18px]" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
          <IconSpinner className="h-4 w-4 text-brand-500" />
          Loading...
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 px-5 py-4 text-sm text-rose-700">
          <IconAlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          message={emptyMessage}
          actionLabel={emptyAction?.label}
          onAction={emptyAction?.onClick}
        />
      ) : visible.length === 0 ? (
        <EmptyState message={`No results for "${query}"`} />
      ) : (
        <ul className="divide-y divide-slate-100">
          {visible.map((row) => (
            <li key={row.id}>
              <button
                onClick={() => onSelect(row)}
                className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-slate-50/70"
              >
                <span className="w-44 flex-shrink-0 truncate text-sm text-slate-800">
                  <span className="text-slate-400">To: </span>
                  {row.recipient}
                </span>
                <StatusBadge
                  status={row.status}
                  time={row.status === "SENT" ? row.sentAt : row.scheduledAt}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-slate-600">
                  <span className="font-medium text-slate-800">{row.subject}</span>
                  <span className="text-slate-400"> - {preview(row.body)}</span>
                </span>
                <IconStar className="h-4 w-4 flex-shrink-0 text-slate-300" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
