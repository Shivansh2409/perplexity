import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
  // Check localStorage first
  const saved = localStorage.getItem("theme");
  if (saved) return saved;

  // Check system preference
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
};

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    mode: getInitialTheme(), // 'light' or 'dark'
  },
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.mode);
      // Update document class
      if (state.mode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
    setTheme(state, action) {
      state.mode = action.payload; // 'light' or 'dark'
      localStorage.setItem("theme", state.mode);
      if (action.payload === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
