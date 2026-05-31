import { configureStore } from "@reduxjs/toolkit";
import { thunk } from "redux-thunk";
import testReducer from "@/redux/slices/testSlice";
import authReducer from "@/redux/slices/authSlice";

const store = configureStore({
  reducer: {
    test: testReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk }).concat(thunk),
  devTools: import.meta.env.DEV,
});

export default store;
