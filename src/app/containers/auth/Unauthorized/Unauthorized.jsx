import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ban, Home } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
      <div className="text-center space-y-4 max-w-md">
        <Ban size={48} className="mx-auto text-error" />
        <h1 className="text-xl font-bold text-text-primary">Access Denied</h1>
        <p className="text-sm text-text-muted">You don't have permission to view this page. Contact your administrator if you believe this is an error.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 h-8 px-3 rounded-md border border-border text-xs text-text-secondary hover:bg-bg-surface-hover cursor-pointer">
            <ArrowLeft size={14} /> Go Back
          </button>
          <button onClick={() => navigate('/')} className="flex items-center gap-1 h-8 px-3 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary-hover cursor-pointer">
            <Home size={14} /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
