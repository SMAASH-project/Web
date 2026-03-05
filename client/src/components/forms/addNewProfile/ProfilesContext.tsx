import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { Profile, ProfileContextType } from "./ProfilesTypes";
import { AuthContext } from "@/context/AuthContext";
import {
  apiAddProfile,
  apiGetProfilesByUserId,
  apiDeleteProfile,
} from "@/hooks/useApi";

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export { ProfileContext };

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const { userId } = useContext(AuthContext);

  const fetchProfiles = useCallback(async () => {
    if (userId === null) return;

    try {
      const { data, ok } = await apiGetProfilesByUserId(Number(userId));

      if (!ok || !data) return;

      const fetched: Profile[] = data.map((p) => ({
        id: p.id,
        name: p.display_name,
        avatar: "",
      }));

      setProfiles(fetched);
      if (fetched.length > 0) {
        setSelectedProfile(fetched[0]);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

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

  const removeProfile = async (name: string) => {
    const profile = profiles.find((p) => p.name === name);
    if (!profile) return;

    // If the profile has a server-side id, delete it from the backend first.
    if (profile.id != null) {
      try {
        const { ok, status } = await apiDeleteProfile(profile.id);
        if (!ok) {
          throw new Error(`Failed to delete profile: ${status}`);
        }
      } catch (error) {
        console.error("Error deleting profile:", error);
        throw error;
      }
    }

    setProfiles((prev) => prev.filter((p) => p.name !== name));
    // If the deleted profile was selected, clear the selection.
    if (selectedProfile?.name === name) {
      setSelectedProfile(null);
    }
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
