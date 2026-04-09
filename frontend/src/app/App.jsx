import React, { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./app.routes.jsx";
import { useAuth } from "../features/auth/hooks/useAuth.js";
import ThemeProvider from "../features/theme/ThemeProvider.jsx";

const App = () => {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;
