import { IconMail } from "./icons";

interface Props {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ message, actionLabel, onAction }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm">
        <IconMail className="h-6 w-6" />
      </div>
      <p className="max-w-xs text-sm text-slate-500">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
