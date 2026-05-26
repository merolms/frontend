import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { setAuthErrorHandler } from '@/app/services/http';
import store from '@/redux/store';
import { clearAuth, restoreSession } from '@/redux/slices/authSlice';
import { ThemeProvider } from '@/app/context/ThemeContext';
import { ToastProvider } from '@/app/context/ToastContext';
import AppRoutes from '@/app/Routes';
import 'semantic-ui-css/semantic.min.css';
import './styles/index.scss';
import './app/containers/auth/Auth.scss';
import './app/context/Toast.scss';

// Wire up 401/403 handler → clear Redux auth + redirect to login
// Uses window.location (not useNavigate) because this sits outside <RouterProvider>
const AuthErrorBridge = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    setAuthErrorHandler(() => {
      dispatch(clearAuth());
      window.location.href = '/login';
    });
  }, [dispatch]);

  return children;
};

// Restore auth session on app load
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);
  return children;
};

const router = createBrowserRouter(AppRoutes);

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <AuthErrorBridge>
          <AuthInitializer>
            <ToastProvider>
              <RouterProvider router={router} />
            </ToastProvider>
          </AuthInitializer>
        </AuthErrorBridge>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
