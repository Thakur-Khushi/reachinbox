import { useRef, useState } from "react";
import type { User } from "../types";
import { api, ApiError } from "../services/api";
import { toDatetimeLocal } from "../lib/dateFormat";
import { avatarClasses } from "../lib/avatarColor";
import SendLaterPopover from "./SendLaterPopover";
import Button from "./ui/Button";
import {
  IconUploadCloud,
  IconX,
  IconSpinner,
  IconCheckCircle,
  IconAlertTriangle,
} from "./icons";

function defaultStartTime(): string {
  const d = new Date(Date.now() + 5 * 60 * 1000);
  d.setSeconds(0, 0);
  return toDatetimeLocal(d);
}

const TOOLBAR_GLYPHS = ["B", "I", "U", "•", "1."];
const CHIP_COLLAPSE_LIMIT = 5;

export default function ComposeForm({
  user,
  onScheduled,
}: {
  user: User;
  onScheduled: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [invalidCount, setInvalidCount] = useState(0);
  const [fileName, setFileName] = useState("");
  const [startTime, setStartTime] = useState(defaultStartTime());
  const [delaySeconds, setDelaySeconds] = useState(2);
  const [hourlyLimit, setHourlyLimit] = useState(50);
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [expandChips, setExpandChips] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function parseFile(file: File) {
    setFileName(file.name);
    setError(null);
    setParsing(true);
    try {
      const result = await api.previewRecipients(file);
      setRecipients(result.recipients);
      setInvalidCount(result.invalidCount);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to parse file");
      setRecipients([]);
    } finally {
      setParsing(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  }

  function removeRecipient(email: string) {
    setRecipients((prev) => prev.filter((r) => r !== email));
  }

  function resetForm() {
    setSubject("");
    setBody("");
    setRecipients([]);
    setInvalidCount(0);
    setFileName("");
    setExpandChips(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (recipients.length === 0) {
      setError("Upload a list with at least one valid recipient email first");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createCampaign({
        subject,
        body,
        recipients,
        startTime: new Date(startTime).toISOString(),
        delayMs: delaySeconds * 1000,
        hourlyLimit,
      });
      setSuccess(
        `Scheduled ${res.scheduled} emails, from ${new Date(
          res.firstSendAt
        ).toLocaleString()} to ${new Date(res.lastSendAt).toLocaleString()}.`
      );
      resetForm();
      onScheduled();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to schedule campaign");
    } finally {
      setSubmitting(false);
    }
  }

  const visibleChips =
    expandChips || recipients.length <= CHIP_COLLAPSE_LIMIT
      ? recipients
      : recipients.slice(0, CHIP_COLLAPSE_LIMIT);
  const hiddenCount = recipients.length - visibleChips.length;

  return (
    <div>
      <div
        className="rounded-2xl border border-slate-200 bg-white shadow-card"
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-end gap-1 border-b border-slate-100 px-5 py-2.5">
          <SendLaterPopover value={startTime} onChange={setStartTime} />
          <Button type="submit" form="compose-form" loading={submitting}>
            Send Later
          </Button>
        </div>

        <form id="compose-form" onSubmit={handleSubmit} className="divide-y divide-slate-100">
          <div className="flex items-center gap-3 px-5 py-3">
            <span className="w-20 flex-shrink-0 text-sm text-slate-400">From</span>
            <span
              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${avatarClasses(
                user.email
              )}`}
            >
              {user.name.charAt(0).toUpperCase()}
            </span>
            <span className="text-sm text-slate-700">{user.email}</span>
          </div>

          <div className="flex items-start gap-3 px-5 py-3">
            <span className="w-20 flex-shrink-0 pt-1 text-sm text-slate-400">To</span>
            <div className="min-w-0 flex-1">
              {recipients.length === 0 ? (
                <span className="text-sm text-slate-300">
                  {parsing ? "Parsing file..." : "Upload a list to add recipients"}
                </span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {visibleChips.map((email) => (
                    <span
                      key={email}
                      className="group inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-2.5 pr-1.5 text-xs font-medium text-brand-700"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => removeRecipient(email)}
                        className="text-brand-400 group-hover:text-brand-600"
                      >
                        <IconX className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {hiddenCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpandChips(true)}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200"
                    >
                      +{hiddenCount}
                    </button>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-shrink-0 items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              <IconUploadCloud className="h-4 w-4" />
              Upload List
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {fileName && !parsing && (
            <div className="px-5 py-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700">{fileName}</span> —{" "}
              <span className="font-semibold text-emerald-600">{recipients.length}</span> valid
              address{recipients.length === 1 ? "" : "es"} found
              {invalidCount > 0 && (
                <span className="text-amber-600">, {invalidCount} skipped</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 px-5 py-3">
            <span className="w-20 flex-shrink-0 text-sm text-slate-400">Subject</span>
            <input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 px-5 py-3">
            <label className="flex items-center gap-2 text-sm text-slate-500">
              Delay between 2 emails
              <input
                type="number"
                min={0}
                required
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(Number(e.target.value))}
                className="w-16 rounded-md border border-slate-200 px-2 py-1 text-center text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              sec
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-500">
              Hourly Limit
              <input
                type="number"
                min={1}
                required
                value={hourlyLimit}
                onChange={(e) => setHourlyLimit(Number(e.target.value))}
                className="w-16 rounded-md border border-slate-200 px-2 py-1 text-center text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </label>
          </div>

          <div
            className="flex items-center gap-1 px-5 py-2"
            title="Formatting isn't wired up in this demo — body is sent as plain text"
          >
            {TOOLBAR_GLYPHS.map((glyph) => (
              <span
                key={glyph}
                className="flex h-7 w-7 cursor-default select-none items-center justify-center rounded-md text-xs font-semibold text-slate-300"
              >
                {glyph}
              </span>
            ))}
          </div>

          <div className="px-5 py-4">
            <textarea
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              placeholder="Type Your Reply..."
              className="w-full resize-none border-0 bg-transparent p-0 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-0"
            />
          </div>
        </form>
      </div>

      {dragActive && (
        <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center bg-brand-600/10">
          <div className="rounded-2xl bg-white px-6 py-4 text-sm font-medium text-brand-700 shadow-lg">
            Drop your recipient list to upload
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <IconAlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <IconCheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {success}
        </div>
      )}
      {parsing && (
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
          <IconSpinner className="h-3.5 w-3.5" />
          Parsing recipient list...
        </div>
      )}
    </div>
  );
}
