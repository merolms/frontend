import { configureStore } from "@reduxjs/toolkit";
import { thunk } from "redux-thunk";

import authReducer from "@/redux/slices/authSlice";
import testReducer from "@/redux/slices/testSlice";
import learningPathReducer from "@/redux/slices/learningPathSlice";
import enrollmentReducer from "@/redux/slices/enrollmentSlice";
import courseBuilderReducer from "@/redux/slices/courseBuilderSlice";

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
