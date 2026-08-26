import { useEffect, useRef, useState } from "react";
import { toDatetimeLocal } from "../lib/dateFormat";
import { IconClock, IconCalendar } from "./icons";
import Button from "./ui/Button";

interface Preset {
  label: string;
  getDate: () => Date;
}

const PRESETS: Preset[] = [
  { label: "In 1 minute", getDate: () => new Date(Date.now() + 60 * 1000) },
  { label: "In 5 minutes", getDate: () => new Date(Date.now() + 5 * 60 * 1000) },
  { label: "In 1 hour", getDate: () => new Date(Date.now() + 60 * 60 * 1000) },
  {
    label: "Tomorrow, 9:00 AM",
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SendLaterPopover({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function openPopover() {
    setDraft(value);
    setOpen(true);
  }

  function applyPreset(date: Date) {
    setDraft(toDatetimeLocal(date));
  }

  function handleDone() {
    onChange(draft);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPopover())}
        title="Send later"
        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
      >
        <IconClock className="h-[18px] w-[18px]" />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-10 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Send Later</h3>

          <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <IconCalendar className="h-3.5 w-3.5" />
            Pick date &amp; time
          </label>
          <input
            type="datetime-local"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="mb-3 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />

          <div className="mb-4 space-y-0.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.getDate())}
                className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-slate-600 hover:bg-slate-50"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={handleDone}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
