import { useState, useCallback } from "react";
import { SecurityKeyContext } from "./SecurityKeyContext";

const SESSION_KEY = "smaash_security_key";
const SESSION_FIRST = "smaash_first_session";

function readSession(): { key: string | null; isFirst: boolean } {
  return {
    key: sessionStorage.getItem(SESSION_KEY),
    isFirst: sessionStorage.getItem(SESSION_FIRST) === "1",
  };
}

export function SecurityKeyProvider({ children }: { children: React.ReactNode }) {
  const [securityKey, setSecurityKeyState] = useState<string | null>(() => readSession().key);
  const [isFirstSession, setIsFirstSession] = useState<boolean>(() => readSession().isFirst);

  const setSecurityKey = useCallback((key: string) => {
    sessionStorage.setItem(SESSION_KEY, key);
    sessionStorage.setItem(SESSION_FIRST, "1");
    setSecurityKeyState(key);
    setIsFirstSession(true);
  }, []);

  const clearSecurityKey = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_FIRST);
    setSecurityKeyState(null);
    setIsFirstSession(false);
  }, []);

  const markKeySeen = useCallback(() => {
    sessionStorage.removeItem(SESSION_FIRST);
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
