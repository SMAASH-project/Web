import { createContext, useContext } from "react";

export interface SecurityKeyContextType {
  securityKey: string | null;
  setSecurityKey: (key: string) => void;
  clearSecurityKey: () => void;
  /** True when a key was set in this session — drives the first-login banner. */
  isFirstSession: boolean;
  markKeySeen: () => void;
}

export const SecurityKeyContext = createContext<SecurityKeyContextType>({
  securityKey: null,
  setSecurityKey: () => {},
  clearSecurityKey: () => {},
  isFirstSession: false,
  markKeySeen: () => {},
});

export function useSecurityKey() {
  return useContext(SecurityKeyContext);
}
