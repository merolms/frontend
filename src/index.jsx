import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import store from '@/redux/store';
import { restoreSession } from '@/redux/slices/authSlice';
import { ThemeProvider } from '@/app/context/ThemeContext';
import AppRoutes from '@/app/Routes';
import 'semantic-ui-css/semantic.min.css';
import './styles/index.scss';
import './app/containers/auth/Auth.scss';

// Restore auth session on app load
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);
  return children;
};

// Router setup
const router = createBrowserRouter(AppRoutes);

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <AuthInitializer>
          <RouterProvider router={router} />
        </AuthInitializer>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
