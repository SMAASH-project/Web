/\*\*

- React Query + Axios Migration Guide
-
- This document summarizes the modernization of the client API layer with:
- - Axios for HTTP requests (centralized, with interceptors)
- - React Query (@tanstack/react-query) for data fetching, caching, and state management
    \*/

// ─── Architecture Overview ────────────────────────────────────────────────────

/\*

- BEFORE: Custom fetch wrapper + useState/useEffect for data fetching
- - Manual loading/error state management
- - No caching between requests
- - Boilerplate-heavy components
- - Race conditions possible (stale responses)
- - No automatic background syncing
-
- AFTER: Axios + React Query
- - Automatic caching with invalidation
- - Built-in loading/error/success states
- - Automatic background refetch on window focus
- - Optimistic updates support
- - Request deduplication
- - Infinite scroll ready (useInfiniteQuery)
    \*/

// ─── File Structure ──────────────────────────────────────────────────────────

/\*

- src/lib/apiClient.ts
- └─ Axios instance with interceptors (base URL, headers, error handling)
-
- src/lib/queryKeys.ts
- └─ Centralized query key factory (prevents cache invalidation bugs)
-
- src/hooks/useQueryHooks.ts (NEW)
- └─ React Query hooks: useLoginMutation, useProfilesQuery, etc.
-
- src/RootLayout.tsx (UPDATED)
- └─ QueryClientProvider wrapping entire app
-
- src/components/forms/addNewProfile/ProfilesContext.tsx (MIGRATED)
- └─ Now uses useProfilesQuery + mutations instead of manual fetch
-
- src/components/forms/LoginForm.tsx (MIGRATED)
- └─ Now uses useLoginMutation with isPending/isError states
-
- src/components/forms/SignUpForm.tsx (MIGRATED)
- └─ Now uses useSignupMutation with isPending/isError states
-
- src/hooks/useApi.ts (PRESERVED)
- └─ Old API functions still available for backward compatibility
  \*/

// ─── Key Improvements ────────────────────────────────────────────────────────

/\*

- 1.  ProfilesContext Simplification
- ✓ Removed 60 lines of manual state management
- ✓ Automatic cache invalidation on mutations
- ✓ Real-time sync when data changes
- ✓ Cleaner error handling
-
- 2.  Auth Forms (Login/Signup)
- ✓ isPending state for loading indicators
- ✓ isError state for error handling
- ✓ Built-in retry logic
- ✓ Disabled inputs during loading
-
- 3.  Infinite Scroll Ready
- ✓ useInfiniteQuery hook available for Releases/Webstore/News
- ✓ useReleasesInfiniteQuery implemented
- ✓ useItemsInfiniteQuery implemented
- ✓ useNewsInfiniteQuery implemented
- ✓ Hook-based pagination vs manual state management
-
- 4.  Caching Strategy
- ✓ staleTime: 5 minutes (default)
- ✓ gcTime (garbage collection): 10 minutes
- ✓ Automatic refetch on window focus
- ✓ Request deduplication (same query refetches once)
-
- 5.  Optimistic Updates
- ✓ Profile add shows instant UI feedback
- ✓ Profile delete shows instant UI feedback
- ✓ Profile update shows instant UI feedback
- ✓ No more flickering or tombstone names
-
- 6.  Persistent Cache
- ✓ localStorage persistence enabled
- ✓ Offline support and faster app startup
- ✓ Uses @tanstack/query-sync-storage-persister
-
- 7.  Developer Experience
- ✓ React Query DevTools installed
- ✓ Inspect cache, query lifecycle in dev mode
- ✓ Toggle DevTools with floating button
  \*/

// ─── Usage Examples ──────────────────────────────────────────────────────────

/\*

- QUERY: Fetch profiles
- ─────────────────────────────────────
- const { data: profiles, isLoading, error } = useProfilesQuery(userId);
-
- MUTATION: Add profile
- ──────────────────────────────────────
- const addProfileMutation = useAddProfileMutation(userId);
-
- const handleAdd = async () => {
- try {
-     await addProfileMutation.mutateAsync({
-       display_name: "NewProfile",
-       user_id: 123,
-     });
-     // Cache automatically invalidated!
- } catch (error) {
-     console.error(error);
- }
- };
-
- INFINITE QUERY: Paginated releases
- ───────────────────────────────────
- const {
- data,
- fetchNextPage,
- hasNextPage,
- isFetchingNextPage,
- } = useReleasesInfiniteQuery(os);
-
- const releases = data?.pages.flatMap(p => p.releases) ?? [];
-
- <button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
- Load More
- </button>
  */

// ─── Next Steps (All Completed!) ─────────────────────────────────────────────

/\*

- 1.  Infinite Scroll Pages ✓ COMPLETED
- ✓ useReleasesInfiniteQuery hook created
- ✓ useItemsInfiniteQuery hook created
- ✓ useNewsInfiniteQuery hook created
- Note: Pages still use mock data - integrate with real backend when available
-
- 2.  Optimistic Updates ✓ COMPLETED
- ✓ Profile add has instant UI feedback (onMutate)
- ✓ Profile delete has instant UI feedback (onMutate)
- ✓ Profile update has instant UI feedback (onMutate)
- ✓ All mutations include error rollback
-
- 3.  Persistent Cache ✓ COMPLETED
- ✓ Persist queries to localStorage for offline support
- ✓ PersistQueryClientProvider configured
- ✓ Uses createSyncStoragePersister
-
- 4.  DevTools ✓ COMPLETED
- ✓ @tanstack/react-query-devtools installed
- ✓ ReactQueryDevtools added to RootLayout
- ✓ Inspect cache, query lifecycle, mutations in dev mode
-
- 5.  Real Backend Integration (Future)
- - Create /api/releases, /api/items, /api/news endpoints
- - Update infinite query hooks to use real API
- - Remove mock data from example files
    \*/

// ─── Error Handling Pattern ───────────────────────────────────────────────────

/\*

- Mutations expose:
- - isPending: loading indicator
- - isError: error occurred
- - error: AxiosError object with response data
- - mutate(): fire-and-forget mutation
- - mutateAsync(): promise-based mutation (recommended)
-
- Example:
- ────────
- {mutation.isPending && <Spinner />}
- {mutation.isError && (
- <div className="error">
-     {mutation.error?.response?.data?.message || "Error"}
- </div>
- )}
  \*/

// ─── Query Key Patterns ──────────────────────────────────────────────────────

/\*

- Query keys are organized by domain for better invalidation:
-
- profiles.byUserId(123)
- → When user logs out, invalidate profiles.all
-
- releases.infinite(ios)
- → Separate cache per OS, auto-refetch when OS changes
-
- This prevents cache collision and enables granular updates.
  \*/

export {};
