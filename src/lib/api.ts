import { clearAuth } from "@/lib/auth-storage";
import type { ApiMessage, ApiRoom, ApiUser } from "@/types";

// Single source of truth for the backend location. Override it by setting
// NEXT_PUBLIC_API_URL (e.g. in .env.local) — no code changes needed.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
}

async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Couldn't reach the server. Is the backend running?", 0);
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => ({})) : undefined;

  if (!res.ok) {
    // A 401 on a request that carried a token means that token is no longer
    // valid (expired/invalid) — drop the stale session so the next guarded
    // page load sends the user back to /login instead of looping on 401s.
    if (res.status === 401 && token) clearAuth();

    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status);
  }

  return data as T;
}

// --- Auth ---------------------------------------------------------------

export function registerUser(input: { name: string; email: string; password: string }) {
  return apiFetch<{ token: string; user: ApiUser }>("/auth/register", {
    method: "POST",
    body: input,
  });
}

export function loginUser(input: { email: string; password: string }) {
  return apiFetch<{ token: string; user: ApiUser }>("/auth/login", {
    method: "POST",
    body: input,
  });
}

export function getMe(token: string) {
  return apiFetch<{ user: ApiUser }>("/auth/me", { token });
}

// --- Rooms ----------------------------------------------------------------

export function listRooms(token: string) {
  return apiFetch<{ rooms: ApiRoom[] }>("/rooms", { token });
}

export function createRoom(
  token: string,
  input: {
    title: string;
    movieName?: string;
    movieSource?: string;
    sourceType?: "url" | "upload" | "library";
    isPrivate?: boolean;
    maxGuests?: number;
    chatEnabled?: boolean;
    voiceEnabled?: boolean;
    allowGuestControl?: boolean;
  }
) {
  return apiFetch<{ room: ApiRoom }>("/rooms", { method: "POST", body: input, token });
}

export function getRoom(token: string, code: string) {
  return apiFetch<{ room: ApiRoom }>(`/rooms/${code}`, { token });
}

export function deleteRoom(token: string, code: string) {
  return apiFetch<{ message: string; code: string }>(`/rooms/${code}`, {
    method: "DELETE",
    token,
  });
}

export function joinRoom(token: string, code: string) {
  return apiFetch<{ room: ApiRoom }>(`/rooms/${code}/join`, { method: "POST", token });
}

export function leaveRoom(token: string, code: string) {
  return apiFetch<{ message: string }>(`/rooms/${code}/leave`, { method: "POST", token });
}

export function updatePlayback(
  token: string,
  code: string,
  input: { isPlaying?: boolean; progress?: number }
) {
  return apiFetch<{ playback: ApiRoom["playback"] }>(`/rooms/${code}/playback`, {
    method: "PATCH",
    body: input,
    token,
  });
}

export function getMessages(token: string, code: string) {
  return apiFetch<{ messages: ApiMessage[] }>(`/rooms/${code}/messages`, { token });
}

// --- WebRTC -----------------------------------------------------------

// Proxied through our own backend rather than calling Metered directly —
// see backend/src/controllers/turnController.js for why: the API key stays
// server-side only, never in a NEXT_PUBLIC_ variable anyone could copy out
// of the browser bundle. Returns [] (STUN-only) if TURN isn't configured.
export function getTurnCredentials(token: string) {
  return apiFetch<RTCIceServer[]>("/turn/credentials", { token });
}
