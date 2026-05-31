import { configureStore } from "@reduxjs/toolkit";
import { thunk } from "redux-thunk";

import authReducer from "@/redux/slices/authSlice";
import testReducer from "@/redux/slices/testSlice";

const store = configureStore({
  reducer: {
    test: testReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk }).concat(thunk),
  devTools: import.meta.env.DEV,
});

export default store;
