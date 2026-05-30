import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Check, Mail } from 'lucide-react';
import { forgotPassword } from '@/app/services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { setLoading(true); setError(null); await forgotPassword(email); setSuccess(true); }
    catch (err) { setError(err.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="text-lg font-semibold text-text-primary text-center mb-6">Forgot Password</h2>

          {success ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2.5 text-sm text-success">
                <Check size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Check your email</p>
                  <p className="text-xs">If an account with that email exists, we've sent password reset instructions.</p>
                </div>
              </div>
              <Link to="/login" className="flex items-center justify-center gap-1 w-full h-10 rounded-lg border border-border text-sm text-text-primary hover:bg-bg-surface-hover transition-colors">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <p className="text-xs text-text-muted text-center mb-4">Enter your email address and we'll send you instructions to reset your password.</p>
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-error/30 bg-error/5 px-3 py-2.5 text-sm text-error mb-4">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-text-primary">Email</label>
                  <div className="relative mt-1">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field pl-9" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <Link to="/login" className="flex items-center justify-center gap-1 text-xs text-primary hover:underline mt-4">
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
