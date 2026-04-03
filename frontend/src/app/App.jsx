import React, { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./app.routes.jsx";
import { useAuth } from "../features/auth/hooks/useAuth.js";

const App = () => {
  const { getCurrentUser } = useAuth();

  useEffect(() => {
    getCurrentUser();
  }, []);
  return <RouterProvider router={router} />;
};

export default App;
