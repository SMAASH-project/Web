import React, { createContext, useContext, useState } from "react";
import type { Profile, ProfileContextType } from "./ProfilesTypes";
import { AuthContext } from "@/context/AuthContext";
import { apiAddProfile } from "@/hooks/useApi";

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export { ProfileContext };

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  // async function getProfilesById() {
  //     const ProfilesResponse = await fetch("/api/profiles");
  //     if (!ProfilesResponse.ok) {
  //       throw new Error("Failed to fetch profiles");
  //     }
  //     return ProfilesResponse.json();
  //   }
  const [profiles, setProfiles] = useState<Profile[]>([
    // {ProfilesResponse}
  ]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(
    profiles.length > 0 ? profiles[0] : null,
  );

  const { userId } = useContext(AuthContext);

  // Posts to the server via the centralized API, then updates local state on success.
  const addProfile = async (profile: Profile) => {
    try {
      if (userId === null) {
        throw new Error("User is not logged in");
      }

      const { data, ok, status } = await apiAddProfile({
        display_name: profile.name,
        user_id: Number(userId),
      });

      if (!ok) {
        throw new Error(`Failed to add profile: ${status}`);
      }

      // The server may return the created profile with a `name` field.
      // If it does, use it; otherwise fall back to the profile we sent.
      const toAdd: Profile = data?.name
        ? { name: data.name, avatar: data.avatar ?? profile.avatar }
        : profile;
      setProfiles((prev) => [...prev, toAdd]);
    } catch (error) {
      console.error("Error adding profile:", error);
      // Keep UI stable; do not optimistic-update. Optionally, surface error to caller by rethrowing.
      // Rethrow so callers can react if they awaited addProfile.
      throw error;
    }
  };

  const removeProfile = (name: string) => {
    setProfiles((prev) => prev.filter((profile) => profile.name !== name));
  };

  const selectProfile = (name: string) => {
    const found = profiles.find((p) => p.name === name) || null;
    setSelectedProfile(found);
  };

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        addProfile,
        removeProfile,
        selectedProfile,
        selectProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
