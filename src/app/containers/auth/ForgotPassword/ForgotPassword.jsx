import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Check, Mail } from "lucide-react";
import { forgotPassword } from "@/app/services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="text-text-primary mb-6 text-center text-lg font-semibold">
            Forgot Password
          </h2>

          {success ? (
            <div className="space-y-4">
              <div className="border-success/30 bg-success/5 text-success flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm">
                <Check size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Check your email</p>
                  <p className="text-xs">
                    If an account with that email exists, we've sent password reset instructions.
                  </p>
                </div>
              </div>
              <Link
                to="/login"
                className="border-border text-text-primary hover:bg-bg-surface-hover flex h-10 w-full items-center justify-center gap-1 rounded-lg border text-sm transition-colors"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <p className="text-text-muted mb-4 text-center text-xs">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
              {error && (
                <div className="border-error/30 bg-error/5 text-error mb-4 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-text-primary text-sm font-medium">Email</label>
                  <div className="relative mt-1">
                    <Mail
                      size={14}
                      className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                    />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="input-field pl-9"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary-hover h-10 w-full cursor-pointer rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
              <Link
                to="/login"
                className="text-primary mt-4 flex items-center justify-center gap-1 text-xs hover:underline"
              >
                <ArrowLeft size={12} /> Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
