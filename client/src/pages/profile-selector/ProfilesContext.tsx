import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import type { Profile, ProfileContextType } from "./ProfilesTypes";
import { AuthContext } from "@/context/AuthContext";
import {
  useProfilesQuery,
  useAddProfileMutation,
  useDeleteProfileMutation,
  type ProfileResponse,
} from "@/hooks/useQueryHooks";

const defaultProfileContext: ProfileContextType = {
  profiles: [],
  addProfile: async () => {},
  removeProfile: async () => {},
  selectedProfile: null,
  selectProfile: () => {},
};

const ProfileContext = createContext<ProfileContextType>(defaultProfileContext);

export { ProfileContext };

function profileStorageKey(userId: number | string) {
  return `selected_profile_${userId}`;
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);

  const { userId } = useContext(AuthContext);
  const numUserId = userId !== null ? Number(userId) : null;

  const { data: fetchedProfiles = [] } = useProfilesQuery(numUserId);
  const addProfileMutation = useAddProfileMutation();
  const deleteProfileMutation = useDeleteProfileMutation();

  // Restore the persisted selection once we have both a userId and the
  // fetched profiles list. We validate that the stored ID still exists —
  // the user may have deleted the profile since the last session.
  useEffect(() => {
    if (!userId || !numUserId || fetchedProfiles.length === 0) return;
    const stored = localStorage.getItem(profileStorageKey(String(userId)));
    if (!stored) return;
    const storedId = parseInt(stored, 10);
    const stillExists = fetchedProfiles.some((p: ProfileResponse) => p.id === storedId);
    if (stillExists) setSelectedProfileId(storedId);
  }, [userId, numUserId, fetchedProfiles]);

  const profiles = useMemo<Profile[]>(
    () =>
      fetchedProfiles.map((p: ProfileResponse) => ({
        id: p.id,
        name: p.display_name,
        avatar: p.avatar_url ?? `/api/profiles/${p.id}/pfp`,
        coins: p.coins,
        last_login: p.last_login,
      })),
    [fetchedProfiles],
  );

  const selectedProfile = useMemo<Profile | null>(() => {
    if (profiles.length === 0) return null;
    if (selectedProfileId === null) return profiles[0];
    return profiles.find((p) => p.id === selectedProfileId) ?? profiles[0];
  }, [profiles, selectedProfileId]);

  const addProfile = useCallback(
    async (profile: Profile) => {
      if (!numUserId) throw new Error("User is not logged in");

      await addProfileMutation.mutateAsync({
        display_name: profile.name,
        user_id: numUserId,
        profile_picture: profile.avatarFile ?? null,
      });
    },
    [addProfileMutation, numUserId],
  );

  const removeProfile = useCallback(
    async (name: string) => {
      const profile = profiles.find((p) => p.name === name);
      if (!profile?.id || !numUserId) return;

      await deleteProfileMutation.mutateAsync({
        profileId: profile.id,
        userId: numUserId,
      });
    },
    [deleteProfileMutation, numUserId, profiles],
  );

  const selectProfile = useCallback(
    (name: string) => {
      const found = profiles.find((p) => p.name === name) || null;
      const id = found?.id ?? null;
      setSelectedProfileId(id);
      if (userId) {
        if (id !== null) {
          localStorage.setItem(profileStorageKey(String(userId)), String(id));
        } else {
          localStorage.removeItem(profileStorageKey(String(userId)));
        }
      }
    },
    [profiles, userId],
  );

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
