import { useContext } from "react";
import { ProfileContext } from "@/pages/profile-selector/ProfilesContext";

export function useProfiles() {
  return useContext(ProfileContext);
}
