import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  // useCallback,
} from "react";
import type { Profile, ProfileContextType } from "./ProfilesTypes";
import { AuthContext } from "@/context/AuthContext";
import {
  useProfilesQuery,
  useAddProfileMutation,
  useUpdateProfileMutation,
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

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(
    null,
  );

  const { userId } = useContext(AuthContext);
  const numUserId = userId !== null ? Number(userId) : null;

  const { data: fetchedProfiles = [] } = useProfilesQuery(numUserId);
  const addProfileMutation = useAddProfileMutation();
  const updateProfileMutation = useUpdateProfileMutation();
  const deleteProfileMutation = useDeleteProfileMutation();

  const profiles = useMemo<Profile[]>(
    () =>
      fetchedProfiles.map((p: ProfileResponse) => ({
        id: p.id,
        name: p.display_name,
        avatar: "",
        coins: p.coins,
      })),
    [fetchedProfiles],
  );

  const selectedProfile = useMemo<Profile | null>(() => {
    if (profiles.length === 0) {
      return null;
    }

    if (selectedProfileId === null) {
      return profiles[0];
    }

    return profiles.find((p) => p.id === selectedProfileId) ?? profiles[0];
  }, [profiles, selectedProfileId]);

  console.warn("User: ", userId);
  console.warn("Profiles: ", profiles);

  // useEffect(() => {
  //   fetchProfiles();
  // }, [fetchProfiles]);

  // Posts to the server via the centralized API, then updates local state on success.
  const addProfile = async (profile: Profile) => {
    if (!numUserId) {
      throw new Error("User is not logged in");
    }

    await addProfileMutation.mutateAsync({
      display_name: profile.name,
      user_id: numUserId,
    });

    // No return needed - mutations handle cache invalidation
  };

  const removeProfile = async (name: string) => {
    const profile = profiles.find((p) => p.name === name);
    if (!profile || !profile.id) return;

    try {
      // Rename to tombstone first (without optimistic rename in UI),
      // then delete optimistically so tombstone text never flashes.
      const tombstoneName =
        `del_${profile.id}_${Date.now().toString(36)}`.slice(0, 20);

      await updateProfileMutation.mutateAsync({
        profileId: profile.id,
        payload: {
          id: profile.id,
          display_name: tombstoneName,
          coins: profile.coins ?? 0,
        },
        optimistic: false,
        invalidateAfterSuccess: false,
      });

      await deleteProfileMutation.mutateAsync(profile.id);
    } catch (error) {
      console.error("Error deleting profile:", error);
      throw error;
    }
  };

  const selectProfile = (name: string) => {
    const found = profiles.find((p) => p.name === name) || null;
    setSelectedProfileId(found?.id ?? null);
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
