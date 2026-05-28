import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { setAuthErrorHandler } from '@/app/services/http';
import store from '@/redux/store';
import { clearAuth, restoreSession } from '@/redux/slices/authSlice';
import { ThemeProvider } from '@/app/context/ThemeContext';
import { ToastProvider } from '@/app/context/ToastContext';
import AppRoutes from '@/app/Routes';
import './styles/tailwind.css';
import './styles/index.scss';
import './app/containers/auth/Auth.scss';
import './app/context/Toast.scss';

const theme = createTheme({
  fontFamily: "MicrosoftNewTaiLue, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  primaryColor: 'green',
  colors: {
    green: [
      '#f0fff4', '#c6f6d5', '#9ae6b4', '#68d391',
      '#4ade80', '#33a163', '#276749', '#22543d',
      '#1a2e23', '#122218',
    ],
  },
});

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
  // <React.StrictMode>
    <Provider store={store}>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <Notifications position="top-right" zIndex={9999} />
        <ThemeProvider>
          <AuthErrorBridge>
            <AuthInitializer>
              <ToastProvider>
                <RouterProvider router={router} />
              </ToastProvider>
            </AuthInitializer>
          </AuthErrorBridge>
        </ThemeProvider>
      </MantineProvider>
    </Provider>
  // </React.StrictMode>
);
