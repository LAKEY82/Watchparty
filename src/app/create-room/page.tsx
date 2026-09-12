"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Globe2,
  Loader2,
  Lock,
  Sparkles,
  Users,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/utils";
import { useRequireAuth } from "@/hooks/useAuth";
import { ApiError, createRoom } from "@/lib/api";

export default function CreateRoomPage() {
  const router = useRouter();
  const { token, ready } = useRequireAuth();

  const [title, setTitle] = useState("Friday Movie Night");
  const [movieName, setMovieName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [allowGuestControl, setAllowGuestControl] = useState(false);
  const [maxGuests, setMaxGuests] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setError(null);
    setLoading(true);

    try {
      // The host picks their movie file from inside the room itself, once
      // it exists — see VideoPlayer's "Select your movie" step. There's
      // nothing to ask for here, so this always creates an "upload" room:
      // no movieSource URL to collect, and it's what makes the host's
      // local file get streamed to guests over WebRTC rather than every
      // guest needing the same file themselves.
      const { room } = await createRoom(token, {
        title,
        movieName,
        sourceType: "upload",
        isPrivate,
        maxGuests,
        chatEnabled,
        voiceEnabled,
        allowGuestControl,
      });
      router.push(`/room/${room.code}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the room. Try again.");
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <div className="bg-cinema flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="bg-cinema min-h-screen px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Create a room</h1>
          <p className="mt-1 text-sm text-muted">
            Set up your watch party in a few quick steps.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <GlassPanel className="space-y-6 p-6 sm:p-8">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="room-name">Room name</Label>
              <Input
                id="room-name"
                placeholder="Friday Movie Night"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="movie-name">Movie name (optional)</Label>
              <Input
                id="movie-name"
                placeholder="e.g. Nocturne Drive"
                value={movieName}
                onChange={(e) => setMovieName(e.target.value)}
              />
              <p className="mt-1.5 text-xs text-muted">
                Just a label for the room — you&apos;ll pick the actual movie file once you&apos;re
                inside.
              </p>
            </div>

            <div>
              <Label>Privacy</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border p-3 text-left transition-colors",
                    isPrivate ? "border-accent/60 bg-accent/10" : "border-white/10 hover:bg-white/5"
                  )}
                >
                  <Lock className="h-4 w-4 text-accent" />
                  <div>
                    <p className="text-sm font-medium">Private</p>
                    <p className="text-xs text-muted">Invite only</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border p-3 text-left transition-colors",
                    !isPrivate ? "border-accent/60 bg-accent/10" : "border-white/10 hover:bg-white/5"
                  )}
                >
                  <Globe2 className="h-4 w-4 text-accent" />
                  <div>
                    <p className="text-sm font-medium">Public</p>
                    <p className="text-xs text-muted">Anyone with link</p>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="mb-0 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Max guests
                </Label>
                <span className="text-sm font-medium">{maxGuests}</span>
              </div>
              <input
                type="range"
                min={2}
                max={50}
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="divide-y divide-white/10 rounded-xl bg-white/3 px-4">
              <Switch
                checked={chatEnabled}
                onChange={setChatEnabled}
                label="Live chat"
                description="Let guests message during the movie"
              />
              <Switch
                checked={voiceEnabled}
                onChange={setVoiceEnabled}
                label="Voice & video"
                description="Allow mic and camera in the room"
              />
              <Switch
                checked={allowGuestControl}
                onChange={setAllowGuestControl}
                label="Guest playback control"
                description="Let anyone play, pause, and seek — not just the host"
              />
            </div>

            <Button type="submit" size="lg" className="group w-full" disabled={loading}>
              <Sparkles className="h-4 w-4" />
              {loading ? "Creating room…" : "Create room"}
            </Button>
          </GlassPanel>
        </form>
      </div>
    </div>
  );
}
