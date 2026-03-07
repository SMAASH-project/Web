import React, { createContext, useContext } from "react";
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
  const authContext = useContext(AuthContext);

  const userId = authContext?.userId;
  const parsedUserId = userId ? Number(userId) : null;
  const numUserId =
    typeof parsedUserId === "number" && Number.isFinite(parsedUserId)
      ? parsedUserId
      : null;

  // Query for fetching profiles
  const { data: profileResponses } = useProfilesQuery(numUserId);

  // Mutations for profile operations
  const addProfileMutation = useAddProfileMutation();
  const updateProfileMutation = useUpdateProfileMutation();
  const deleteProfileMutation = useDeleteProfileMutation();

  // Transform ProfileResponse[] to Profile[]
  const profiles: Profile[] = (profileResponses || []).map(
    (pr: ProfileResponse) => ({
      id: pr.id,
      name: pr.display_name,
      avatar: "", // Backend doesn't return avatar, use empty string
      coins: pr.coins,
    }),
  );

  // Local state for selected profile (UI state, not server state)
  const [selectedProfile, setSelectedProfile] = React.useState<Profile | null>(
    null,
  );

  // Sync selected profile when profiles list changes
  React.useEffect(() => {
    if (profiles.length === 0) {
      setSelectedProfile(null);
    } else if (
      !selectedProfile ||
      !profiles.find((p) => p.id === selectedProfile.id)
    ) {
      // Re-select first profile if current selection is invalid
      setSelectedProfile(profiles[0] || null);
    }
  }, [profiles, selectedProfile]);

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
