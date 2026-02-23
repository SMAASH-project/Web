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

  const addProfile = (profile: Profile) => {
    setProfiles((prev) => [...prev, profile]);
  };

  const removeProfile = (name: string) => {
    setProfiles((prev) => prev.filter((profile) => profile.name !== name));
  };

  return (
    <ProfileContext.Provider value={{ profiles, addProfile, removeProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
