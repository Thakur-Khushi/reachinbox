import type { EmailStatus } from "../types";

const STYLES: Record<EmailStatus, { pill: string; dot: string }> = {
  SCHEDULED: { pill: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200", dot: "bg-sky-500" },
  PROCESSING: { pill: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200", dot: "bg-amber-500" },
  SENT: { pill: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200", dot: "bg-emerald-500" },
  FAILED: { pill: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200", dot: "bg-rose-500" },
};

export default function StatusBadge({ status }: { status: EmailStatus }) {
  const { pill, dot } = STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot} ${status === "PROCESSING" ? "animate-pulse" : ""}`} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
