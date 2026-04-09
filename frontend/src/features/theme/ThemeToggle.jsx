import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../theme/theme.slice";
import { Sun, Moon } from "lucide-react";

/**
 * ThemeToggle Component
 * Button to switch between light and dark themes
 * Can be placed in navbar or header
 */
export const ThemeToggle = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className={`p-2 rounded-lg transition-all duration-300 ${
        theme === "dark"
          ? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
      }`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;
