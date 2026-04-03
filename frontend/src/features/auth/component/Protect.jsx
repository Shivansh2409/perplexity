import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

const Protect = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);

  console.log("Protect component - auth state:", { user, loading });
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] text-[#ececec] font-sans">
        <div className="text-center">
          <h1 className="text-3xl font-semibold mb-2 tracking-tight text-white">
            Loading...
          </h1>
        </div>
      </div>
    );
  }

  // If no user is found in the auth state, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render children if passed directly, otherwise render nested routes via Outlet
  return children ? children : <Outlet />;
};

export default Protect;
