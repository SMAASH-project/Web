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
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const { userId } = useContext(AuthContext);

  console.warn("User: ", userId);
  console.warn("Profiles: ", profiles);

  useEffect(() => {
    const fetchProfiles = async () => {
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
    }
    fetchProfiles();
  }, [userId]);

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
