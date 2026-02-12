const API_BASE_URL =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env &&
    ((import.meta as any).env.VITE_API_URL as string | undefined)) ||
  "http://localhost:4000";

export interface ApiUser {
  id: string;
  email: string;
  status: string;
}

export interface ApiTeamSummary {
  id: string;
  name: string;
  role: string;
}

export interface MeResponse {
  user: ApiUser;
  teams: ApiTeamSummary[];
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("unauthorized");
    }
    const text = await res.text();
    throw new Error(text || `Request failed with ${res.status}`);
  }

  if (res.status === 204) {
    // no content
    return undefined as T;
  }

  return (await res.json()) as T;
}

export async function fetchMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>("/auth/me");
}

export async function requestMagicLink(email: string): Promise<void> {
  await apiFetch("/auth/login-magic-link", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export interface CreateTeamPayload {
  name: string;
  categories?: string[];
  invites?: string[];
}

export interface CreateTeamResponse {
  id: string;
  name: string;
}

export async function createTeam(
  payload: CreateTeamPayload
): Promise<CreateTeamResponse> {
  return apiFetch<CreateTeamResponse>("/teams", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

