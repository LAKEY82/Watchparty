import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SyncSnapshot } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function formatRelativeTime(isoDate: string): string {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return "";

  const diffMs = Date.now() - then;
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;

  return new Date(isoDate).toLocaleDateString();
}

// Where the video *should* be right now, given a playback state snapshot.
//
// `serverTime` and `state.updatedAt` are both timestamps from the SAME
// clock (the server's), so comparing them tells us how much "playing" time
// had already elapsed by the moment the snapshot was sent — no client/
// server clock agreement needed for that part. The remaining stretch, from
// "when this client received the snapshot" to "now", is measured entirely
// on the client's own clock. Only network latency (client receiving the
// message) is unaccounted for, which is normally small.
export function computeExpectedPosition(snapshot: SyncSnapshot, nowClientMs: number): number {
  const { state, serverTime, receivedAt } = snapshot;
  if (state.status !== "playing") return state.position;

  const serverElapsedAtReceipt = (serverTime - state.updatedAt) / 1000;
  const clientElapsedSinceReceipt = (nowClientMs - receivedAt) / 1000;
  return state.position + (serverElapsedAtReceipt + clientElapsedSinceReceipt) * state.playbackRate;
}
