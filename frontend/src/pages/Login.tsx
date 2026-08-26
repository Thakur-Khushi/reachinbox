import { api } from "../services/api";
import Button from "../components/ui/Button";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
        <h1 className="mb-6 text-center text-2xl font-bold text-slate-900">Login</h1>

        <a
          href={api.googleLoginUrl()}
          className="flex w-full items-center justify-center gap-2.5 rounded-full bg-brand-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-brand-100"
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
          Login with Google
        </a>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-100" />
          <span className="text-xs text-slate-400">or sign up through email</span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        <div className="space-y-3">
          <input
            disabled
            placeholder="Email ID"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-400 placeholder:text-slate-400"
          />
          <input
            disabled
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-400 placeholder:text-slate-400"
          />
          <Button disabled className="w-full rounded-lg !py-2.5">
            Login
          </Button>
          <p className="text-center text-xs text-slate-400">
            Email/password sign-in isn't available — please continue with Google above.
          </p>
        </div>
      </div>
    </div>
  );
}
