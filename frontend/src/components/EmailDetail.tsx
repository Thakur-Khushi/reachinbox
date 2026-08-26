import type { EmailRecipient } from "../types";
import { avatarClasses } from "../lib/avatarColor";
import { IconArrowLeft } from "./icons";
import StatusBadge from "./StatusBadge";
import Button from "./ui/Button";

export default function EmailDetail({
  email,
  onBack,
}: {
  email: EmailRecipient;
  onBack: () => void;
}) {
  const timestamp = email.sentAt ?? email.scheduledAt;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <button
          onClick={onBack}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <IconArrowLeft className="h-[18px] w-[18px]" />
        </button>
        <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-slate-900">
          {email.subject}
        </h2>
        <StatusBadge status={email.status} time={email.scheduledAt} />
      </div>

      <div className="flex items-start gap-3 px-5 py-4">
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarClasses(
            email.recipient
          )}`}
        >
          {email.recipient.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm text-slate-800">
            <span className="text-slate-400">To </span>
            {email.recipient}
          </div>
          <div className="text-xs text-slate-400">
            {timestamp ? new Date(timestamp).toLocaleString() : "-"}
          </div>
        </div>
      </div>

      <div className="whitespace-pre-wrap px-5 pb-6 text-sm leading-relaxed text-slate-700">
        {email.body}
      </div>

      {email.previewUrl && (
        <div className="border-t border-slate-100 px-5 py-4">
          <Button variant="outline" onClick={() => window.open(email.previewUrl!, "_blank")}>
            View Ethereal preview →
          </Button>
        </div>
      )}

      {email.error && (
        <div className="border-t border-slate-100 px-5 py-4 text-sm text-rose-600">
          Error: {email.error}
        </div>
      )}
    </div>
  );
}
