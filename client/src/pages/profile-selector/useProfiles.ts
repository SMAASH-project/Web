import { useContext } from "react";
import { ProfileContext } from "@/components/forms/addNewProfile/ProfilesContext";

export function useProfiles() {
  return useContext(ProfileContext);
}
