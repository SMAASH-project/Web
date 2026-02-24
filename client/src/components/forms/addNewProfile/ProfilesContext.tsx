import React, { createContext, useState } from "react";
import SlimeArt from "../../../assets/SlimeArt.png";
import type { Profile, ProfileContextType } from "./ProfilesTypes";

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export { ProfileContext };

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([
    {
      name: "plh1",
      avatar: SlimeArt,
    },
  ]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(
    profiles.length > 0 ? profiles[0] : null,
  );

  const addProfile = (profile: Profile) => {
    setProfiles((prev) => [...prev, profile]);
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
