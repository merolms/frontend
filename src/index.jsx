import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { thunk } from 'redux-thunk';

import App from './App';
import Routes from './app/Routes';
import testSlice from './redux/slices/testSlice';
import 'semantic-ui-css/semantic.min.css';
import './styles/index.scss';

// Configure store with Redux Toolkit
const store = configureStore({
  reducer: {
    test: testSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk }).concat(thunk),
  devTools: process.env.NODE_ENV !== 'production',
});

// Router setup (v6 style)
const router = createBrowserRouter([
  {
    path: '/',
    element: <Routes />,
  },
]);

// Render with React 18 createRoot
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
