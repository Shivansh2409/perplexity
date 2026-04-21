import React, { useEffect,useState } from "react";
import { Navigate, Outlet } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { hydrateAuthSuccess, hydrateAuthFailure } from "../auth.slice";

const Protect = ({ children }) => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const { getCurrentUser } = useAuth();
  const [isInitializing, setIsInitializing] = useState(!user);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await getCurrentUser();
        if (res && res.user) {
          dispatch(hydrateAuthSuccess(res));
        } else {
          dispatch(hydrateAuthFailure("No user found"));
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
        dispatch(hydrateAuthFailure(err.response?.data?.message || "Authentication failed"));
      } finally {
        setIsInitializing(false);
      }
    };

    if (!user) {
      getUser();
    } else {
      setIsInitializing(false);
    }
  }, [dispatch, user, getCurrentUser]);

  if (loading || isInitializing) {
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
  return children;
};

export default Protect;
