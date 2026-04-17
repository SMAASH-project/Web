import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { useWhoAmIQuery } from "@/hooks/useQueryHooks";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<bigint | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSupport, setIsSupport] = useState(false);

  // Becomes true once the whoami effect has run for the first time.
  // Without this guard there is a brief render where isLoading=false but the
  // effect hasn't yet called setIsLoggedIn — RequireAuth would see
  // isInitializing=false + isLoggedIn=false and redirect to /login, causing a
  // full navigate-to-profile-selector → auto-redirect-to-releases chain on
  // every page refresh.
  const [isAuthSettled, setIsAuthSettled] = useState(false);

  const { data, isLoading } = useWhoAmIQuery();

  useEffect(() => {
    if (isLoading) return;

    if (data?.id) {
      setUserId(BigInt(data.id));
      setIsAdmin(data.role === "admin");
      setIsSupport(data.role === "support");
      setIsLoggedIn(true);
    } else {
      // whoami failed or returned no user (401, session expired, network error).
      // Reset auth state so protected routes redirect to login correctly.
      setIsLoggedIn(false);
      setUserId(null);
      setIsAdmin(false);
      setIsSupport(false);
    }

    // All of the above setters and this one are batched into a single render
    // by React 18's automatic batching, so consumers never see an intermediate
    // state where isInitializing=false and isLoggedIn is still stale.
    setIsAuthSettled(true);
  }, [data, isLoading]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        // Keep isInitializing true until the effect has settled auth state.
        isInitializing: isLoading || !isAuthSettled,
        userId,
        setUserId,
        setIsLoggedIn,
        isAdmin,
        setIsAdmin,
        isSupport,
        setIsSupport,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
