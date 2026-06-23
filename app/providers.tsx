"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { clearAuth, restoreSession } from "@/redux/slices/authSlice";
import store from "@/redux/store";
import { setAuthErrorHandler } from "@/services/http";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ─── Auth Error Bridge ────────────────────────────────────
const AuthErrorBridge = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    setAuthErrorHandler(() => {
      dispatch(clearAuth() as any);
      window.location.href = "/login";
    });
  }, [dispatch]);
  return children;
};

// ─── Auth Initializer ─────────────────────────────────────
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(restoreSession() as any);
  }, [dispatch]);
  return children;
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ThemeProvider>
          <SidebarProvider>
            <AuthErrorBridge>
              <AuthInitializer>
                <ToastProvider>
                  {children}
                  <Toaster position="top-right" richColors closeButton />
                </ToastProvider>
              </AuthInitializer>
            </AuthErrorBridge>
          </SidebarProvider>
        </ThemeProvider>
      </Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
