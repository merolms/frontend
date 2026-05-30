import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GraduationCap, AlertCircle, Lock, Mail } from 'lucide-react';
import { loginUser } from '@/redux/slices/authSlice';

const demoAccounts = [
  { role: 'admin', label: 'Admin', email: 'admin@meroedu.com', password: 'admin123' },
  { role: 'instructor', label: 'Instructor', email: 'instructor@meroedu.com', password: 'instructor123' },
  { role: 'teamlead', label: 'Team Lead', email: 'teamlead@meroedu.com', password: 'teamlead123' },
  { role: 'student', label: 'Student', email: 'student@meroedu.com', password: 'student123' },
];

const inputCls = "flex h-9 w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary shadow-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from?.pathname || '/', { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(email, password));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-bg-surface p-8 shadow-sm space-y-6">
          {/* Brand */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: 'var(--primary-light)' }}>
              <GraduationCap size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">MeroEdu</h1>
            <p className="text-sm text-text-muted">Learning Management System</p>
          </div>

          <h2 className="text-center text-lg font-semibold text-text-primary">Sign In</h2>
          <p className="text-center text-sm text-text-muted -mt-4">Enter your credentials to access your account.</p>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'var(--error)' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={`${inputCls} pl-9`} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className={`${inputCls} pl-9`} />
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="w-full h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 cursor-pointer">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="space-y-2">
            <p className="text-center text-xs text-text-muted">Demo Accounts</p>
            <div className="space-y-1.5">
              {demoAccounts.map((acct) => (
                <button key={acct.role} type="button" onClick={() => { setEmail(acct.email); setPassword(acct.password); }}
                  className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-xs hover:bg-bg-surface-hover transition-colors">
                  <span className={`rounded px-2 py-0.5 font-medium text-xs`} style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{acct.label}</span>
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
