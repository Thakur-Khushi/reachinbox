import type { EmailRecipient } from "../types";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";

interface Props {
  rows: EmailRecipient[];
  loading: boolean;
  error: string | null;
  emptyMessage: string;
  timeColumnLabel: "Scheduled time" | "Sent time";
  timeField: "scheduledAt" | "sentAt";
  showPreviewLink?: boolean;
}

export default function RecipientTable({
  rows,
  loading,
  error,
  emptyMessage,
  timeColumnLabel,
  timeField,
  showPreviewLink,
}: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Email</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Subject</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">
              {timeColumnLabel}
            </th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
            {showPreviewLink && (
              <th className="px-4 py-2 text-left font-medium text-gray-500">Preview</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((row) => {
            const timeValue = row[timeField];
            return (
              <tr key={row.id}>
                <td className="px-4 py-2 text-gray-900">{row.recipient}</td>
                <td className="px-4 py-2 text-gray-700">{row.subject}</td>
                <td className="px-4 py-2 text-gray-700">
                  {timeValue ? new Date(timeValue).toLocaleString() : "-"}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge status={row.status} />
                </td>
                {showPreviewLink && (
                  <td className="px-4 py-2">
                    {row.previewUrl ? (
                      <a
                        href={row.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
