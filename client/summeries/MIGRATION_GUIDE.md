# React Query + Axios Migration Guide

This document summarizes the migration from manual API state handling to Axios + React Query.

## Migration goals

- Centralize HTTP behavior (base URL, credentials, common error handling)
- Replace manual `useEffect` fetch patterns with query/mutation hooks
- Improve cache consistency through query keys and invalidation
- Enable optimistic updates and rollback paths for profile operations
- Reduce repetitive loading/error boilerplate in form components

## Architecture overview

### Previous approach

- component-scoped fetch calls
- manual loading and error flags
- no shared server-state cache
- higher risk of duplicate requests and stale UI

### Current approach

- Axios client: shared transport configuration
- React Query: cache, retries, background refetch, mutation lifecycle
- Query key factory: deterministic key composition by domain and params

## File map

- `src/lib/apiClient.ts`
  - shared Axios instance
- `src/lib/queryKeys.ts`
  - centralized query key builders
- `src/hooks/useQueryHooks.ts`
  - query/mutation hooks + API DTO types
- `src/RootLayout.tsx`
  - query provider, persistence, devtools
- `src/components/forms/addNewProfile/ProfilesContext.tsx`
  - profile read/write integration via hooks
- `src/components/forms/LoginForm.tsx`
  - login mutation integration
- `src/components/forms/SignUpForm.tsx`
  - signup mutation integration

> Note: legacy `src/hooks/useApi.ts` is removed. Types and request logic are now consolidated in hook modules and the shared Axios client.

## Key technical improvements

### Server-state handling

- profile state is sourced from `useProfilesQuery(userId)`
- cache invalidation and refetch behavior are declarative
- mutation lifecycle (`onMutate`, `onError`, `onSuccess`/`onSettled`) enables safe optimistic UI

### Form flow improvements

- mutations expose `isPending`, `isError`, and `error`
- `mutateAsync` supports structured `try/catch` submit flows

### Pagination foundation

- infinite-query hooks added for releases, items, and news
- pages can adopt incremental loading with `fetchNextPage()` and `hasNextPage`

## Usage examples

### Query usage

```ts
const { data: profiles, isLoading, error } = useProfilesQuery(userId);
```

### Mutation usage

```ts
await addProfileMutation.mutateAsync({
  display_name: "NewProfile",
  user_id: 123,
});
```

### Infinite query usage

```ts
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useReleasesInfiniteQuery(os);

const releases = data?.pages.flatMap((page) => page.releases) ?? [];
```

## Error handling pattern

- UI state is derived from React Query flags:
  - `isPending` for in-flight requests
  - `isError` + `error` for request failures
- prefer backend error messages when present; use fallback copy otherwise

Example:

```tsx
{
  mutation.isPending && <Spinner />;
}
{
  mutation.isError && (
    <div className="error">
      {mutation.error?.response?.data?.message ?? "Request failed"}
    </div>
  );
}
```

## Query key strategy

- Domain-first keys for predictable invalidation:
  - `profiles.byUserId(userId)`
  - `releases.infinite(os)`
  - `news.byCategory(categories)`
- Use targeted invalidation where possible; use domain-level invalidation for cross-cutting consistency requirements.

## Current status and remaining work

- Migration to React Query + Axios is complete for auth/profile flows.
- Infinite-query hooks are implemented.
- Remaining integration work: connect all infinite-query consumers to production pagination endpoints where mock/placeholder data still exists.
