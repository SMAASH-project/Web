/**
 * Query keys for React Query consistency.
 * Organized by domain for easy cache invalidation.
 */

export const queryKeys = {
  profiles: {
    all: ["profiles"],
    byUserId: (userId: number) => ["profiles", "byUserId", userId],
  },
  githubReleases: {
    all: ["githubReleases"],
  },
  items: {
    all: ["items"],
  },
  purchases: {
    byProfileId: (profileId: number) => ["purchases", "byProfileId", profileId],
  },
};
