import Link from "next/link";
import { ArrowRight, KeyRound, Plus } from "lucide-react";

export function QuickActions() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Link
        href="/create-room"
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 p-6 shadow-lg shadow-fuchsia-500/20 transition-transform hover:-translate-y-1"
      >
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
          <Plus className="h-5 w-5 text-white" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-white">Create a room</h3>
        <p className="mb-4 text-sm text-white/80">
          Start a new watch party and invite your friends.
        </p>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white">
          Get started
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>

      <Link
        href="/join-room"
        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:-translate-y-1 hover:bg-white/[0.08]"
      >
        <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
          <KeyRound className="h-5 w-5 text-accent" />
        </div>
        <h3 className="mb-1 text-lg font-semibold">Join a room</h3>
        <p className="mb-4 text-sm text-muted">
          Enter a room code or link to join a friend&apos;s party.
        </p>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
          Join now
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </div>
  );
}
