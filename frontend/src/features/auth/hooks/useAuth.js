import { useDispatch } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  hydrateAuthStart,
  hydrateAuthSuccess,
  hydrateAuthFailure,
} from "../auth.slice";

import { authApi } from "../service/auth.api";

export const useAuth = () => {
  const dispatch = useDispatch();

  const login = async (credentials) => {
    dispatch(loginStart());
    try {
      const response = await authApi.login(credentials);
      dispatch(loginSuccess(response.data));
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || "Login failed"));
    }
  };

  const register = async (userData) => {
    dispatch(registerStart());
    try {
      const response = await authApi.register(userData);
      dispatch(registerSuccess(response.data));
    } catch (err) {
      dispatch(
        registerFailure(err.response?.data?.message || "Registration failed"),
      );
    }
  };

  const logoutUser = async () => {
    try {
      await authApi.logout();
      dispatch(logout());
    } catch (err) {
      console.error(
        "Logout failed:",
        err.response?.data?.message || err.message,
      );
    }
  };

  const getCurrentUser = async () => {
    dispatch(hydrateAuthStart());
    try {
      const response = await authApi.getCurrentUser();
      dispatch(hydrateAuthSuccess(response.data));
      console.log(response);
    } catch (err) {
      console.error(
        "Failed to fetch current user:",
        err.response?.data?.message || err.message,
      );
      dispatch(hydrateAuthFailure(err.response?.data?.message || err.message));
      return null;
    }
  };

  return { login, register, logoutUser, getCurrentUser };
};
