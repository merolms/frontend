import { createSlice } from "@reduxjs/toolkit";

import {
  getStoredAuth,
  login as authLogin,
  logout as authLogout,
  storeAuth,
  validateToken,
} from "@/services/authService";

// Restore session on load
const stored = getStoredAuth();

const initialState = {
  user: stored?.user || null,
  token: stored?.token || null,
  isAuthenticated: !!stored?.token,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
      if (action.payload) state.error = null;
    },
    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setLoading, setError, setAuth, clearAuth } = authSlice.actions;

// Thunks
export const loginUser = (email, password) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const { user, token } = await authLogin(email, password);
    storeAuth(user, token);
    dispatch(setAuth({ user, token }));
  } catch (err) {
    dispatch(setError(err.message || "Login failed."));
  }
};

export const logoutUser = () => (dispatch) => {
  authLogout();
  dispatch(clearAuth());
};

// Restore session: validate the stored token by calling /auth/me
export const restoreSession = () => async (dispatch) => {
  const stored = getStoredAuth();
  if (!stored?.token) return;
  try {
    dispatch(setLoading(true));
    const user = await validateToken();
    dispatch(setAuth({ user, token: stored.token }));
  } catch {
    authLogout();
    dispatch(clearAuth());
  }
};

export default authSlice.reducer;
