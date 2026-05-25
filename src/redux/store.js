import { configureStore } from '@reduxjs/toolkit';
import { thunk } from 'redux-thunk';
import testReducer from './slices/testSlice';
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    test: testReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk }).concat(thunk),
  devTools: import.meta.env.DEV,
});

export default store;
