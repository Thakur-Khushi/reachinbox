import type { EmailStatus } from "../types";
import { formatPill } from "../lib/dateFormat";
import { IconClock } from "./icons";

const WORD_STYLES: Record<EmailStatus, string> = {
  SCHEDULED: "bg-amber-50 text-amber-700",
  PROCESSING: "bg-amber-50 text-amber-700",
  SENT: "bg-slate-100 text-slate-600",
  FAILED: "bg-rose-50 text-rose-600",
};

interface Props {
  status: EmailStatus;
  /** ISO timestamp — when given for SCHEDULED/PROCESSING, renders a clock + time pill like the Figma design. */
  time?: string | null;
}

export default function StatusBadge({ status, time }: Props) {
  const label = status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <span
      className={`inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${WORD_STYLES[status]}`}
    >
      {status === "SCHEDULED" || status === "PROCESSING" ? (
        <>
          <IconClock className={`h-3 w-3 ${status === "PROCESSING" ? "animate-spin" : ""}`} />
          {time ? formatPill(time) : label}
        </>
      ) : status === "SENT" && time ? (
        `Sent · ${formatPill(time)}`
      ) : (
        label
      )}
    </span>
  );
}
