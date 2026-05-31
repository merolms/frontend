import { AlertCircle, GraduationCap, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { loginUser } from "@/redux/slices/authSlice";

const demoAccounts = [
  { role: "admin", label: "Admin", email: "admin@meroedu.com", password: "admin123" },
  {
    role: "instructor",
    label: "Instructor",
    email: "instructor@meroedu.com",
    password: "instructor123",
  },
  { role: "teamlead", label: "Team Lead", email: "teamlead@meroedu.com", password: "teamlead123" },
  { role: "student", label: "Student", email: "student@meroedu.com", password: "student123" },
];

const inputCls =
  "flex h-9 w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary shadow-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from?.pathname || "/", { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(email, password));
  };

  return (
    <div className="bg-bg-primary flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="border-border bg-bg-surface space-y-6 rounded-xl border p-8 shadow-sm">
          {/* Brand */}
          <div className="space-y-2 text-center">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl"
              style={{ background: "var(--primary-light)" }}
            >
              <GraduationCap size={32} className="text-primary" />
            </div>
            <h1 className="text-text-primary text-2xl font-bold">MeroEdu</h1>
            <p className="text-text-muted text-sm">Learning Management System</p>
          </div>

          <h2 className="text-text-primary text-center text-lg font-semibold">Sign In</h2>
          <p className="text-text-muted -mt-4 text-center text-sm">
            Enter your credentials to access your account.
          </p>

          {error && (
            <div
              className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm"
              style={{
                borderColor: "rgba(239,68,68,0.3)",
                background: "rgba(239,68,68,0.08)",
                color: "var(--error)",
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-text-primary text-sm font-medium">Email</label>
              <div className="relative">
                <Mail
                  size={16}
                  className="text-text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-text-primary text-sm font-medium">Password</label>
              <div className="relative">
                <Lock
                  size={16}
                  className="text-text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-primary text-xs hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-hover h-10 w-full cursor-pointer rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="space-y-2">
            <p className="text-text-muted text-center text-xs">Demo Accounts</p>
            <div className="space-y-1.5">
              {demoAccounts.map((acct) => (
                <button
                  key={acct.role}
                  type="button"
                  onClick={() => {
                    setEmail(acct.email);
                    setPassword(acct.password);
                  }}
                  className="border-border hover:bg-bg-surface-hover flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors"
                >
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium`}
                    style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                  >
                    {acct.label}
                  </span>
                  <span className="text-text-muted">{acct.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
