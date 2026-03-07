import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  // useCallback,
} from "react";
import type { Profile, ProfileContextType } from "./ProfilesTypes";
import { AuthContext } from "@/context/AuthContext";
import {
  apiAddProfile,
  apiGetProfilesByUserId,
  apiDeleteProfile,
  apiUpdateProfile,
} from "@/hooks/useApi";

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export { ProfileContext };

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const { userId } = useContext(AuthContext);

  useEffect(() => {
    let isActive = true;

    const fetchProfiles = async () => {
      // No logged-in user: clear any profile data from a previous account.
      if (userId === null) {
        setProfiles([]);
        setSelectedProfile(null);
        return;
      }

      // Clear stale profiles immediately when switching accounts.
      setProfiles([]);
      setSelectedProfile(null);

      try {
        const { data, ok } = await apiGetProfilesByUserId(Number(userId));

        if (!isActive) return;

        if (!ok || !data) {
          setProfiles([]);
          setSelectedProfile(null);
          return;
        }

        const fetched: Profile[] = data.map((p) => ({
          id: p.id,
          name: p.display_name,
          avatar: "",
          coins: p.coins,
        }));

        setProfiles(fetched);
        setSelectedProfile(fetched.length > 0 ? fetched[0] : null);
      } catch (error) {
        if (!isActive) return;
        console.error("Error fetching profiles:", error);
        setProfiles([]);
        setSelectedProfile(null);
      }
    };

    fetchProfiles();

    return () => {
      isActive = false;
    };
  }, [userId]);

  // useEffect(() => {
  //   fetchProfiles();
  // }, [fetchProfiles]);

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

      // The server returns PlayerProfileReadDTO; keep the server id so deletion
      // always targets the backend row.
      const toAdd: Profile = data
        ? {
            id: data.id,
            name: data.display_name,
            avatar: profile.avatar,
            coins: data.coins,
          }
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

    // If the profile has a server-side id, rename it to a tombstone value first,
    // then delete it. This avoids DB unique-name collisions with soft-deleted rows.
    if (profile.id != null) {
      try {
        const tombstoneName =
          `del_${profile.id}_${Date.now().toString(36)}`.slice(0, 20);

        const renameResult = await apiUpdateProfile(profile.id, {
          id: profile.id,
          display_name: tombstoneName,
          coins: profile.coins ?? 0,
        });

        if (!renameResult.ok) {
          throw new Error(
            `Failed to rename profile before delete: ${renameResult.status}`,
          );
        }

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
