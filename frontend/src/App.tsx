import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import type { User } from "./types";
import { api } from "./services/api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { IconSpinner } from "./components/icons";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-slate-50 text-sm text-slate-400">
        <IconSpinner className="h-4 w-4 text-brand-500" />
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          user ? (
            <Dashboard user={user} onLoggedOut={() => setUser(null)} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}
