import { useContext } from "react";
import { ProfileContext } from "./ProfilesContext";

export function useProfiles() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfiles must be used within ProfileProvider");
  }
  return context;
}
