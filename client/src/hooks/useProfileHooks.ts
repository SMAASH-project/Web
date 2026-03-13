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

function withUniqueSuffix(base: string) {
  const seed = Math.random().toString(36).slice(2, 6);
  const cleanBase = clampDisplayName(base);
  const maxBaseLength = 20 - (seed.length + 1);
  const safeBase = cleanBase.slice(0, Math.max(1, maxBaseLength));
  return `${safeBase}-${seed}`;
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ─── Profile Mutations ───────────────────────────────────────────────────────

export function useAddProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<AddProfileResponse, AxiosError, AddProfilePayload>({
    mutationFn: async (payload) => {
      const { user_id, profile_picture, ...body } = payload;
      let candidateName = clampDisplayName(body.display_name);

      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const { data } = await apiClient.post<AddProfileResponse>(
            `/users/${user_id}/profiles`,
            { display_name: candidateName },
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
        } catch (error) {
          const axiosError = error as AxiosError;
          const status = axiosError.response?.status;
          const isLastAttempt = attempt === 3;

          if (status !== 409 || isLastAttempt) {
            throw error;
          }

          candidateName = withUniqueSuffix(candidateName);
        }
      }

      throw new Error("Failed to create profile");
    },
    onSuccess: (_data, variables) => {
      if (!variables.user_id) return;

      // invalidateQueries marks as stale AND triggers a background refetch
      // for active subscribers — no need to also call refetchQueries separately.
      queryClient.invalidateQueries({
        queryKey: queryKeys.profiles.byUserId(variables.user_id),
      });
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
    onSuccess: (_data, variables) => {
      // Use a versioned URL so the browser fetches the new image instead of
      // serving a stale HTTP-cached response for the same plain URL.
      const versionedUrl = `/api/profiles/${variables.profileId}/pfp?v=${Date.now()}`;

      queryClient.setQueriesData<ProfileResponse[]>(
        { queryKey: queryKeys.profiles.all },
        (old) => {
          if (!Array.isArray(old)) return old;
          return old.map((p) =>
            p.id === variables.profileId
              ? { ...p, avatar_url: versionedUrl }
              : p,
          );
        },
      );

      // Invalidate so any future navigation re-fetches fresh data.
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
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
      if (optimistic === false) return;

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
      if (variables.invalidateAfterSuccess === false) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
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
      await queryClient.cancelQueries({
        queryKey: queryKeys.profiles.byUserId(userId),
      });

      const previousData = queryClient.getQueryData<ProfileResponse[]>(
        queryKeys.profiles.byUserId(userId),
      );

      // Optimistically remove from cache so the UI updates instantly.
      queryClient.setQueryData<ProfileResponse[]>(
        queryKeys.profiles.byUserId(userId),
        (old) => old?.filter((p) => p.id !== profileId),
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

      // Roll back optimistic update on failure.
      const ctx = context as
        | { previousData: ProfileResponse[] | undefined; userId: number }
        | undefined;
      if (ctx?.previousData !== undefined) {
        queryClient.setQueryData(
          queryKeys.profiles.byUserId(ctx.userId),
          ctx.previousData,
        );
      }
    },
    onSuccess: (_data, variables) => {
      // Confirm the list against the server after the delete completes.
      queryClient.invalidateQueries({
        queryKey: queryKeys.profiles.byUserId(variables.userId),
      });
    },
  });
}
