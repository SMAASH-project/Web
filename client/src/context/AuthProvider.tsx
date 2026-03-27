import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { useWhoAmIQuery } from "@/hooks/useQueryHooks";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<bigint | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSupport, setIsSupport] = useState(false);

  const { data, isLoading } = useWhoAmIQuery();

  useEffect(() => {
    if (isLoading) return;

    if (data?.id) {
      setUserId(BigInt(data.id));
      setIsAdmin(data.role === "admin");
      setIsSupport(data.role === "support");
      setIsLoggedIn(true);
    }
  }, [data, isLoading]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isInitializing: isLoading,
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
