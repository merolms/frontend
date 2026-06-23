import { ArrowLeft, Check, Lock } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import FormErrorBanner from "@/components/common/FormErrorBanner";
import { resetPassword } from "@/services/authService";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await resetPassword("mock-token", password);
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
            Reset Password
          </h2>

          {success ? (
            <div className="space-y-4">
              <div className="border-success/30 bg-success/5 text-success flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm">
                <Check size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Password Reset Successful</p>
                  <p className="text-xs">
                    Your password has been updated. You can now sign in with your new password.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="bg-primary hover:bg-primary-hover text-secondary h-10 w-full cursor-pointer rounded-lg text-sm font-medium transition-colors"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <>
              <p className="text-text-muted mb-4 text-center text-xs">
                Enter your new password below.
              </p>
              <FormErrorBanner message={error} />
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-text-primary text-sm font-medium">New Password</label>
                  <div className="relative mt-1">
                    <Lock
                      size={14}
                      className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                    />
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="input-field pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-text-primary text-sm font-medium">Confirm Password</label>
                  <div className="relative mt-1">
                    <Lock
                      size={14}
                      className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                    />
                    <input
                      type="password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="input-field pl-9"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary-hover text-secondary h-10 w-full cursor-pointer rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
