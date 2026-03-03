// ─── Centralized API calls ───────────────────────────────────────────────────
// All server communication lives here so fetch logic isn't scattered across
// components.  Each exported function is a plain async function (not a React
// hook) — call them anywhere: components, contexts, event handlers, etc.
//
// Every function returns  { data, ok, status }  so callers can branch on
// success/failure without inspecting raw Response objects.

// ─── Payload / Response types ────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

/** Shape of the JSON the server sends back on a successful login. */
export interface LoginResponse {
  id?: number;
}

export interface SignupPayload {
  email: string;
  password: string;
  username: string;
  role_id?: number;
}

export interface AddProfilePayload {
  display_name: string;
  user_id: number;
}

/**
 * Shape the server may return after creating a profile.
 * Kept loose (all fields optional) because the backend doesn't guarantee
 * every field — callers should fall back to their own data when needed.
 */
export interface AddProfileResponse {
  name?: string;
  avatar?: string;
}

/** Shape of a player profile as returned by the server (PlayerProfileReadDTO). */
export interface ProfileResponse {
  id: number;
  display_name: string;
  coins: number;
  last_login: string;
}

// ─── Internal helper ─────────────────────────────────────────────────────────

/**
 * Thin wrapper around `fetch` that:
 *  1. Sets JSON headers + credentials by default.
 *  2. Auto-parses the response body as JSON (falls back to null).
 *  3. Returns a simple `{ data, ok, status }` tuple.
 */
async function api<T>(
  url: string,
  options: RequestInit = {},
): Promise<{ data: T; ok: boolean; status: number }> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });

  // Only attempt JSON parsing when the server actually returns JSON.
  // This avoids noisy console errors when the response is HTML (e.g. a
  // proxy fallback or an auth redirect) or has an empty body (204).
  let data: T = null as T;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await res.json().catch(() => null as T);
  }

  return { data, ok: res.ok, status: res.status };
}

// ─── Auth ────────────────────────────────────────────────────────────────────

/** POST /api/auth/login — authenticate a user and receive their id. */
export async function apiLogin(payload: LoginPayload) {
  return api<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** POST /api/auth/signup — register a new user account (role_id defaults to 1). */
export async function apiSignup(payload: SignupPayload) {
  return api<null>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ role_id: 1, ...payload }),
  });
}

/** POST /api/auth/logout — end the current session. */
export async function apiLogout() {
  return api<null>("/api/auth/logout", {
    method: "POST",
  });
}

// ─── Profiles ────────────────────────────────────────────────────────────────

/** POST /api/users/:id/profiles — create a new player profile for the logged-in user. */
export async function apiAddProfile(payload: AddProfilePayload) {
  const { user_id, ...body } = payload;
  return api<AddProfileResponse>(`/api/users/${user_id}/profiles`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** GET /api/users/:id/profiles — fetch all player profiles belonging to a user. */
export async function apiGetProfilesByUserId(userId: number) {
  return api<ProfileResponse[]>(`/api/users/${userId}/profiles`, {
    method: "GET",
  });
}

/** DELETE /api/profiles/:id — delete a player profile by its server-side id. */
export async function apiDeleteProfile(profileId: number) {
  return api<null>(`/api/profiles/${profileId}`, {
    method: "DELETE",
  });
}
