import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setTheme } from "../theme/theme.slice";

/**
 * ThemeProvider Component
 * Initializes theme from localStorage/system preference
 * Wraps entire app to enable dark/light mode
 */
export const ThemeProvider = ({ children }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);

  useEffect(() => {
    // Initialize theme on mount
    const savedTheme = localStorage.getItem("theme") || "light";
    dispatch(setTheme(savedTheme));

    // Apply theme to document
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dispatch]);

  // Apply theme changes whenever theme changes
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return <>{children}</>;
};

export default ThemeProvider;
