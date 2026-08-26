import { useRef, useState } from "react";
import { api, ApiError } from "../services/api";
import {
  IconUploadCloud,
  IconFile,
  IconX,
  IconSpinner,
  IconCheckCircle,
  IconAlertTriangle,
  IconChevronDown,
} from "./icons";
import { avatarClasses } from "../lib/avatarColor";

function defaultStartTime(): string {
  const d = new Date(Date.now() + 5 * 60 * 1000);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function FieldLabel({ children, hint }: { children: string; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="block text-sm font-medium text-slate-700">{children}</label>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

export default function ComposeForm({ onScheduled }: { onScheduled: () => void }) {
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
  const [showList, setShowList] = useState(false);
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

  function clearFile() {
    setFileName("");
    setRecipients([]);
    setInvalidCount(0);
    setShowList(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeRecipient(email: string) {
    setRecipients((prev) => prev.filter((r) => r !== email));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (recipients.length === 0) {
      setError("Upload a file with at least one valid recipient email first");
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
      setSubject("");
      setBody("");
      clearFile();
      onScheduled();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to schedule campaign");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Message</h2>
        <div className="space-y-4">
          <div>
            <FieldLabel>Subject</FieldLabel>
            <input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={inputClasses}
              placeholder="Interview Invitation"
            />
          </div>
          <div>
            <FieldLabel>Body</FieldLabel>
            <textarea
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className={`${inputClasses} resize-none`}
              placeholder="You have been selected for an interview."
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Recipients</h2>

        {!fileName ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              dragActive
                ? "border-brand-400 bg-brand-50"
                : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <IconUploadCloud className="h-8 w-8 text-slate-400" />
            <p className="text-sm text-slate-600">
              <span className="font-medium text-brand-600">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-slate-400">CSV or TXT, one email per line or column</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
                <IconFile className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-800">{fileName}</div>
                {parsing ? (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <IconSpinner className="h-3 w-3" />
                    Parsing...
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-emerald-600">
                      {recipients.length}
                    </span>{" "}
                    valid address{recipients.length === 1 ? "" : "es"} found
                    {invalidCount > 0 && (
                      <span className="text-amber-600">, {invalidCount} skipped</span>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <IconX />
              </button>
            </div>

            {!parsing && recipients.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setShowList((v) => !v)}
                  className="mt-3 flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  <IconChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${showList ? "rotate-180" : ""}`}
                  />
                  {showList ? "Hide recipients" : "View recipients"}
                </button>

                {showList && (
                  <div className="mt-3 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2">
                    <div className="flex flex-wrap gap-1.5">
                      {recipients.map((email) => (
                        <span
                          key={email}
                          className="group flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-1 pr-2 text-xs text-slate-700"
                        >
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-semibold ${avatarClasses(
                              email
                            )}`}
                          >
                            {email.charAt(0).toUpperCase()}
                          </span>
                          {email}
                          <button
                            type="button"
                            onClick={() => removeRecipient(email)}
                            className="text-slate-400 group-hover:text-slate-600"
                            title="Remove"
                          >
                            <IconX className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Send rules</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <FieldLabel>Start time</FieldLabel>
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <FieldLabel hint="Between each email">Delay (seconds)</FieldLabel>
            <input
              type="number"
              min={0}
              required
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(Number(e.target.value))}
              className={inputClasses}
            />
          </div>
          <div>
            <FieldLabel hint="Max sends per hour">Hourly limit</FieldLabel>
            <input
              type="number"
              min={1}
              required
              value={hourlyLimit}
              onChange={(e) => setHourlyLimit(Number(e.target.value))}
              className={inputClasses}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <IconAlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <IconCheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {success}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={submitting || parsing}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting && <IconSpinner className="h-4 w-4" />}
          {submitting ? "Scheduling..." : "Schedule"}
        </button>
        {recipients.length > 0 && !submitting && (
          <span className="text-sm text-slate-500">
            Ready to schedule <span className="font-semibold text-slate-700">{recipients.length}</span> emails
          </span>
        )}
      </div>
    </form>
  );
}
