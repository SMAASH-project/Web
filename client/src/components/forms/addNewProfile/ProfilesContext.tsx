import React, { createContext, useContext, useState } from "react";
import type { Profile, ProfileContextType } from "./ProfilesTypes";
import { AuthContext } from "@/context/AuthContext";

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

  const addProfile = async (profile: Profile) => {
    // Post to server first, then update local state on success.
    try {
      if (userId === null) {
        throw new Error("User is not logged in");
      }

      const response = await fetch("http://localhost:8080/api/auth/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          display_name: profile.name,
          user_id: Number(userId),
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Failed to add profile: ${response.status} ${text}`);
      }

      // If server returns the created profile, use it; otherwise fall back to the provided profile.
      const created = await response.json().catch(() => null);
      const toAdd: Profile = created && created.name ? created : profile;
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
