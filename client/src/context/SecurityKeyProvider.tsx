import { useState, useCallback } from "react";
import { SecurityKeyContext } from "./SecurityKeyContext";

export function SecurityKeyProvider({ children }: { children: React.ReactNode }) {
  const [securityKey, setSecurityKeyState] = useState<string | null>(null);
  const [isFirstSession, setIsFirstSession] = useState(false);

  const setSecurityKey = useCallback((key: string) => {
    setSecurityKeyState(key);
    setIsFirstSession(true);
  }, []);

  const clearSecurityKey = useCallback(() => {
    setSecurityKeyState(null);
    setIsFirstSession(false);
  }, []);

  const markKeySeen = useCallback(() => {
    setIsFirstSession(false);
  }, []);

  return (
    <SecurityKeyContext.Provider
      value={{ securityKey, setSecurityKey, clearSecurityKey, isFirstSession, markKeySeen }}
    >
      {children}
    </SecurityKeyContext.Provider>
  );
}
