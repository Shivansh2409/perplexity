import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
    },
    registerStart(state) {
      state.loading = true;
      state.error = null;
    },
    registerSuccess(state, action) {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    registerFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    hydrateAuthStart(state, action) {
      state.loading = true;
    },
    hydrateAuthSuccess(state, action) {
      state.loading = false;
      state.user = action.payload.user;
    },
    hydrateAuthFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  registerStart,
  registerSuccess,
  registerFailure,
  hydrateAuthStart,
  hydrateAuthSuccess,
  hydrateAuthFailure,
} = authSlice.actions;

export default authSlice.reducer;
