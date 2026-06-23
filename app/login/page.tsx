"use client";

import { AlertCircle, GraduationCap, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { login, storeAuth } from "@/services/authService";

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
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state: any) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { user, token } = await login(email, password);
      storeAuth(user, token);
      // Redirect will happen via useEffect
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="border-border bg-card space-y-6 rounded-xl border p-8 shadow-sm">
          {/* Brand */}
          <div className="space-y-3 text-center">
            <div className="bg-primary text-primary-foreground mx-auto flex h-14 w-14 items-center justify-center rounded-xl shadow-md">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-foreground text-3xl font-bold tracking-tight">MeroEdu</h1>
            <p className="text-muted-foreground text-sm font-medium">Learning Management System</p>
          </div>

          <div className="space-y-1 text-center">
            <h2 className="text-foreground text-xl font-bold tracking-tight">Sign In</h2>
            <p className="text-muted-foreground text-sm font-medium">
              Enter your credentials to access your account.
            </p>
          </div>

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
              <Link href="/forgot-password" className="text-primary text-xs hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 w-full cursor-pointer rounded-lg text-sm font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="border-border w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card text-muted-foreground px-2 font-semibold">
                  Demo Accounts
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {demoAccounts.map((acct) => (
                <button
                  key={acct.role}
                  type="button"
                  onClick={() => {
                    setEmail(acct.email);
                    setPassword(acct.password);
                  }}
                  className="border-border hover:bg-accent hover:text-accent-foreground hover:border-primary/20 flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-xs font-medium transition-all"
                >
                  <span className="bg-primary/10 text-primary rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                    {acct.label}
                  </span>
                  <span className="text-muted-foreground">{acct.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
