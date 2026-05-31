import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  ok: true,
};

const testSlice = createSlice({
  name: "test",
  initialState,
  reducers: {
    setValue: (state, action) => {
      state.ok = action.payload;
    },
  },
});

export const { setValue } = testSlice.actions;
export default testSlice;
