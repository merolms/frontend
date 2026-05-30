import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Check, Lock } from 'lucide-react';
import { resetPassword } from '@/app/services/authService';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    try {
      setLoading(true); setError(null);
      await resetPassword('mock-token', password);
      setSuccess(true);
    } catch (err) { setError(err.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="text-lg font-semibold text-text-primary text-center mb-6">Reset Password</h2>

          {success ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2.5 text-sm text-success">
                <Check size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Password Reset Successful</p>
                  <p className="text-xs">Your password has been updated. You can now sign in with your new password.</p>
                </div>
              </div>
              <button onClick={() => navigate('/login')} className="w-full h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer">
                Go to Sign In
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-text-muted text-center mb-4">Enter your new password below.</p>
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-error/30 bg-error/5 px-3 py-2.5 text-sm text-error mb-4">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-text-primary">New Password</label>
                  <div className="relative mt-1">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field pl-9" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-primary">Confirm Password</label>
                  <div className="relative mt-1">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="input-field pl-9" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50">
                  {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
