import "@/styles/tailwind.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { Provider, useDispatch } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/app/context/ThemeContext";
import { ToastProvider } from "@/app/context/ToastContext";
import AppRoutes from "@/app/Routes";
import { setAuthErrorHandler } from "@/app/services/http";
import { clearAuth, restoreSession } from "@/redux/slices/authSlice";
import store from "@/redux/store";

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

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);
  return children;
};

ReactDOM.createRoot(document.getElementById("root")).render(
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
);
