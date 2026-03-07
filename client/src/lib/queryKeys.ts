/**
 * Query keys for React Query consistency.
 * Organized by domain for easy cache invalidation.
 */

export const queryKeys = {
  auth: {
    all: ["auth"],
    login: ["auth", "login"],
    signup: ["auth", "signup"],
  },
  profiles: {
    all: ["profiles"],
    byUserId: (userId: number) => ["profiles", "byUserId", userId],
    byId: (profileId: number) => ["profiles", "byId", profileId],
  },
  releases: {
    all: ["releases"],
    byOs: (os: string) => ["releases", "byOs", os],
    infinite: (os: string) => ["releases", "infinite", os],
  },
  items: {
    all: ["items"],
    infinite: ["items", "infinite"],
  },
  news: {
    all: ["news"],
    byCategory: (categories: string[]) => ["news", "byCategory", categories],
  },
};
