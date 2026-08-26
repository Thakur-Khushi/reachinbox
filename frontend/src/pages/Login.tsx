import { api } from "../services/api";
import { IconMail, IconClock, IconCheckCircle } from "../components/icons";

const FEATURES = [
  { icon: IconMail, text: "Upload recipients and compose in seconds" },
  { icon: IconClock, text: "Schedule with delay and hourly send limits" },
  { icon: IconCheckCircle, text: "Track every send, live, from one dashboard" },
];

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
            <IconMail className="h-6 w-6" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-900">ReachInbox Scheduler</h1>
            <p className="mt-1 text-sm text-slate-500">
              Sign in with Google to manage your email campaigns.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <a
            href={api.googleLoginUrl()}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.3C29.4 34.9 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.5 39.6 16.2 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.3C40.9 36.5 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"
              />
            </svg>
            Sign in with Google
          </a>

          <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-slate-600">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
