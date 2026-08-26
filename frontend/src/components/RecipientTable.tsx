import type { EmailRecipient } from "../types";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import { IconAlertTriangle, IconSpinner } from "./icons";
import { avatarClasses } from "../lib/avatarColor";

interface Props {
  rows: EmailRecipient[];
  loading: boolean;
  error: string | null;
  emptyMessage: string;
  emptyAction?: { label: string; onClick: () => void };
  timeColumnLabel: "Scheduled time" | "Sent time";
  timeField: "scheduledAt" | "sentAt";
  showPreviewLink?: boolean;
}

export default function RecipientTable({
  rows,
  loading,
  error,
  emptyMessage,
  emptyAction,
  timeColumnLabel,
  timeField,
  showPreviewLink,
}: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-16 text-sm text-slate-500 shadow-card">
        <IconSpinner className="h-4 w-4 text-brand-500" />
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        <IconAlertTriangle className="h-4 w-4 flex-shrink-0" />
        {error}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        message={emptyMessage}
        actionLabel={emptyAction?.label}
        onAction={emptyAction?.onClick}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                To
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Subject
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {timeColumnLabel}
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              {showPreviewLink && (
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Preview
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const timeValue = row[timeField];
              return (
                <tr key={row.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarClasses(
                          row.recipient
                        )}`}
                      >
                        {row.recipient.charAt(0).toUpperCase()}
                      </div>
                      <div className="leading-tight">
                        <span className="mr-1.5 text-xs font-medium text-slate-400">To</span>
                        <span className="text-slate-800">{row.recipient}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{row.subject}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-slate-600">
                    {timeValue ? new Date(timeValue).toLocaleString() : "-"}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  {showPreviewLink && (
                    <td className="px-5 py-3">
                      {row.previewUrl ? (
                        <a
                          href={row.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          View →
                        </a>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
