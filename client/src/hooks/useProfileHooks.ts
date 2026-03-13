import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { queryKeys } from "@/lib/queryKeys";
import { AxiosError } from "axios";

export interface AddProfilePayload {
  display_name: string;
  user_id: number;
  profile_picture?: File | null;
}

export interface AddProfileResponse {
  id: number;
  display_name: string;
  coins: number;
  last_login: string;
}

export interface UpdateProfilePayload {
  id: number;
  display_name: string;
  coins: number;
}

export interface ProfileResponse {
  id: number;
  display_name: string;
  coins: number;
  last_login: string;
  avatar_url?: string;
}

// ─── Private Utilities ───────────────────────────────────────────────────────

function getProfilePictureUrl(profileId: number) {
  return `/api/profiles/${profileId}/pfp`;
}

async function uploadProfilePicture(profileId: number, file: File) {
  const formData = new FormData();
  formData.append("profilePicture", file);

  await apiClient.post(`/profiles/${profileId}/pfpupload`, formData);
}

function clampDisplayName(name: string) {
  return name.trim().slice(0, 20);
}

// ─── Profile Queries ─────────────────────────────────────────────────────────

export function useProfilesQuery(userId: number | null) {
  return useQuery<ProfileResponse[], AxiosError>({
    queryKey: queryKeys.profiles.byUserId(userId ?? 0),
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const { data } = await apiClient.get<ProfileResponse[]>(
        `/users/${userId}/profiles`,
      );

      return data.map((profile) => ({
        ...profile,
        avatar_url: getProfilePictureUrl(profile.id),
      }));
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

// ─── Profile Mutations ───────────────────────────────────────────────────────

export function useAddProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<AddProfileResponse, AxiosError, AddProfilePayload>({
    mutationFn: async (payload) => {
      const { user_id, profile_picture, ...body } = payload;
      const displayName = clampDisplayName(body.display_name);

      const { data } = await apiClient.post<AddProfileResponse>(
        `/users/${user_id}/profiles`,
        { display_name: displayName },
      );

      if (profile_picture) {
        try {
          await uploadProfilePicture(data.id, profile_picture);
        } catch (uploadError) {
          console.error(
            "Profile created but picture upload failed:",
            uploadError,
          );
        }
      }

      return data;
    },
    onSuccess: async (_data, variables) => {
      const requestedUserId = variables.user_id;
      if (!requestedUserId) {
        return;
      }

      // Always invalidate + refetch after adding a profile to ensure fresh list
      try {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.profiles.byUserId(requestedUserId),
        });

        await queryClient.refetchQueries({
          queryKey: queryKeys.profiles.byUserId(requestedUserId),
        });
      } catch (err) {
        console.error("Failed to refetch profiles after add:", err);
      }
    },
    onError: (error) => {
      const axiosError = error as AxiosError;
      console.error(
        "Add profile failed:",
        axiosError.response?.status,
        axiosError.response?.data ?? axiosError.message,
      );
    },
  });
}

export function useUploadProfilePictureMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, { profileId: number; file: File }>({
    mutationFn: async ({ profileId, file }) => {
      await uploadProfilePicture(profileId, file);
    },
    onSuccess: async (_data, variables) => {
      // Invalidate the generic profiles prefix so lists refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });

      // Also invalidate the specific profile entry to be safe
      try {
        queryClient.invalidateQueries({
          queryKey: queryKeys.profiles.byId(variables.profileId),
        });
      } catch (err) {
        // ignore
      }
      // Invalidate and refetch to ensure fresh data is loaded from the server
      try {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.profiles.all,
        });
        await queryClient.refetchQueries({ queryKey: queryKeys.profiles.all });

        await queryClient.invalidateQueries({
          queryKey: queryKeys.profiles.byId(variables.profileId),
        });
        await queryClient.refetchQueries({
          queryKey: queryKeys.profiles.byId(variables.profileId),
        });
      } catch (err) {
        // ignore
      }
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError,
    {
      profileId: number;
      payload: UpdateProfilePayload;
      optimistic?: boolean;
      invalidateAfterSuccess?: boolean;
    }
  >({
    mutationFn: async ({ profileId, payload }) => {
      await apiClient.put(`/profiles/${profileId}`, payload);
    },
    onMutate: async ({ profileId, payload, optimistic }) => {
      if (optimistic === false) {
        return;
      }

      queryClient.setQueriesData<ProfileResponse[]>(
        { queryKey: queryKeys.profiles.all },
        (old) => {
          if (!old) return old;
          return old.map((p) =>
            p.id === profileId
              ? { ...p, display_name: payload.display_name }
              : p,
          );
        },
      );
    },
    onSuccess: (_data, variables) => {
      if (variables.invalidateAfterSuccess === false) {
        return;
      }

      // Invalidate all profile queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.profiles.all,
      });
    },
  });
}

export function useDeleteProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, { profileId: number; userId: number }>({
    mutationFn: async ({ profileId }) => {
      await apiClient.delete(`/profiles/${profileId}`);
    },
    onMutate: async ({ profileId, userId }) => {
      // Cancel any in-flight queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.profiles.byUserId(userId),
      });

      // Snapshot previous data
      const previousData = queryClient.getQueryData<ProfileResponse[]>(
        queryKeys.profiles.byUserId(userId),
      );

      // Optimistically remove from cache
      queryClient.setQueryData<ProfileResponse[]>(
        queryKeys.profiles.byUserId(userId),
        (old) => {
          if (!old) return old;
          return old.filter((p) => p.id !== profileId);
        },
      );

      return { previousData, userId };
    },
    onError: (error, _variables, context) => {
      const axiosError = error as AxiosError;
      console.error(
        "Delete profile failed:",
        axiosError.response?.status,
        axiosError.response?.data ?? axiosError.message,
      );
      // Rollback on error
      const rollbackContext = context as
        | { previousData: ProfileResponse[] | undefined; userId: number }
        | undefined;
      if (rollbackContext?.previousData !== undefined) {
        queryClient.setQueryData(
          queryKeys.profiles.byUserId(rollbackContext.userId),
          rollbackContext.previousData,
        );
      }
    },
    onSuccess: async (_data, variables) => {
      // Invalidate + refetch after deleting to ensure fresh list
      try {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.profiles.byUserId(variables.userId),
        });

        await queryClient.refetchQueries({
          queryKey: queryKeys.profiles.byUserId(variables.userId),
        });
      } catch (err) {
        console.error("Failed to refetch profiles after delete:", err);
      }
    },
  });
}
