import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

export function RequireAuth() {
  const { isLoggedIn, isInitializing } = useContext(AuthContext);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  return isLoggedIn ? <Outlet /> : <Navigate to="/app/login" replace />;
}
