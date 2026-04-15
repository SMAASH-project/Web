import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

export function RequireAuth() {
  const { isLoggedIn, isInitializing } = useContext(AuthContext);

  if (isInitializing) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-white" />
      </div>
    );
  }

  return isLoggedIn ? <Outlet /> : <Navigate to="/app/login" replace />;
}
