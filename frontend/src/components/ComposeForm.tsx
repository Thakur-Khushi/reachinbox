import { useState } from "react";
import { api, ApiError } from "../services/api";

function defaultStartTime(): string {
  const d = new Date(Date.now() + 5 * 60 * 1000);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
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
      setRecipients([]);
      setFileName("");
      onScheduled();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to schedule campaign");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700">Subject</label>
        <input
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Interview Invitation"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Body</label>
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="You have been selected for an interview."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Recipients (CSV or text file)
        </label>
        <input
          type="file"
          accept=".csv,.txt"
          onChange={handleFileChange}
          className="mt-1 w-full text-sm"
        />
        {parsing && <p className="mt-1 text-sm text-gray-500">Parsing file...</p>}
        {!parsing && fileName && (
          <p className="mt-1 text-sm text-gray-600">
            {fileName}: <span className="font-medium">{recipients.length}</span> valid
            address{recipients.length === 1 ? "" : "es"} found
            {invalidCount > 0 && `, ${invalidCount} invalid skipped`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start time</label>
          <input
            type="datetime-local"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Delay (seconds)
          </label>
          <input
            type="number"
            min={0}
            required
            value={delaySeconds}
            onChange={(e) => setDelaySeconds(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hourly limit
          </label>
          <input
            type="number"
            min={1}
            required
            value={hourlyLimit}
            onChange={(e) => setHourlyLimit(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || parsing}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Scheduling..." : "Schedule"}
      </button>
    </form>
  );
}
