import { configureStore } from "@reduxjs/toolkit";
import { thunk } from "redux-thunk";

import authReducer from "@/redux/slices/authSlice";
import courseBuilderReducer from "@/redux/slices/courseBuilderSlice";
import enrollmentReducer from "@/redux/slices/enrollmentSlice";
import learningPathReducer from "@/redux/slices/learningPathSlice";
import testReducer from "@/redux/slices/testSlice";

const store = configureStore({
  reducer: {
    test: testReducer,
    auth: authReducer,
    learningPaths: learningPathReducer,
    enrollments: enrollmentReducer,
    courseBuilder: courseBuilderReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk }).concat(thunk),
  devTools: import.meta.env.DEV,
});

export default store;
