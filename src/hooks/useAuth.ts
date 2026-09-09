"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, getStoredUser, getToken } from "@/lib/auth-storage";
import { disconnectSocket } from "@/lib/socket";

const noopSubscribe = () => () => {};

// True only once the client has taken over from the server-rendered HTML.
// localStorage doesn't exist on the server, so we must not trust its value
// (or decide anything based on it, like redirecting) until this flips.
function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

// Redirects to /login if there's no stored session. Pages that need a
// logged-in user should call this and wait for `ready` before rendering
// anything that depends on `user`/`token`.
export function useRequireAuth() {
  const router = useRouter();
  const mounted = useMounted();

  const token = mounted ? getToken() : null;
  const user = mounted ? getStoredUser() : null;
  const ready = mounted && Boolean(token && user);

  useEffect(() => {
    if (mounted && !ready) router.replace("/login");
  }, [mounted, ready, router]);

  function logout() {
    disconnectSocket();
    clearAuth();
    router.replace("/login");
  }

  return { user, token, ready, logout };
}

// The inverse guard: bounces an already-logged-in user away from /login or
// /register and into /dashboard, instead of letting them "log in" twice.
export function useRedirectIfAuthed() {
  const router = useRouter();
  const mounted = useMounted();

  const isAuthed = mounted && Boolean(getToken() && getStoredUser());

  useEffect(() => {
    if (isAuthed) router.replace("/dashboard");
  }, [isAuthed, router]);

  return { checking: !mounted || isAuthed };
}
