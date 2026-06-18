import "@/styles/tailwind.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { Provider, useDispatch } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { ThemeProvider } from "@/app/context/ThemeContext";
import { ToastProvider } from "@/app/context/ToastContext";
import AppRoutes from "@/app/Routes";
import { setAuthErrorHandler } from "@/app/services/http";
import { clearAuth, restoreSession } from "@/redux/slices/authSlice";
import store from "@/redux/store";

// ─── TanStack Query Client ────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 seconds — data is "fresh" for 30s
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      refetchOnReconnect: true, // Refetch when network reconnects
    },
    mutations: {
      retry: 0, // Don't retry mutations (POST/PUT/DELETE)
    },
  },
});

// ─── Auth Error Bridge ────────────────────────────────────
const AuthErrorBridge = ({ children }) => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    setAuthErrorHandler(() => {
      dispatch(clearAuth());
      window.location.href = "/login";
    });
  }, [dispatch]);
  return children;
};

// ─── Auth Initializer ─────────────────────────────────────
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);
  return children;
};

// ─── App Root ─────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <ThemeProvider>
        <AuthErrorBridge>
          <AuthInitializer>
            <ToastProvider>
              <RouterProvider router={createBrowserRouter(AppRoutes)} />
              <Toaster position="top-right" richColors closeButton />
            </ToastProvider>
          </AuthInitializer>
        </AuthErrorBridge>
      </ThemeProvider>
    </Provider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
