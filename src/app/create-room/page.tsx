"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Film,
  Globe2,
  Lock,
  Sparkles,
  Upload,
  Users,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/utils";

const sourceTabs = [
  { id: "url", label: "Paste URL", icon: Globe2 },
  { id: "upload", label: "Upload file", icon: Upload },
  { id: "library", label: "From library", icon: Film },
] as const;

export default function CreateRoomPage() {
  const router = useRouter();
  const [source, setSource] = useState<(typeof sourceTabs)[number]["id"]>("url");
  const [isPrivate, setIsPrivate] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [maxGuests, setMaxGuests] = useState(10);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/room/new"), 700);
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
            <div>
              <Label htmlFor="room-name">Room name</Label>
              <Input id="room-name" placeholder="Friday Movie Night" required defaultValue="Friday Movie Night" />
            </div>

            <div>
              <Label>Movie source</Label>
              <div className="mb-3 grid grid-cols-3 gap-2 rounded-xl bg-white/5 p-1">
                {sourceTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSource(tab.id)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all sm:text-sm",
                      source === tab.id
                        ? "bg-white/10 text-foreground shadow-sm"
                        : "text-muted hover:text-foreground"
                    )}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {source === "url" && (
                <Input placeholder="https://example.com/movie.mp4" required />
              )}
              {source === "upload" && (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-8 text-center transition-colors hover:border-accent/50 hover:bg-white/5">
                  <Upload className="h-5 w-5 text-muted" />
                  <span className="text-sm text-muted">
                    Drag & drop a video file, or{" "}
                    <span className="text-accent">browse</span>
                  </span>
                  <input type="file" className="hidden" accept="video/*" />
                </label>
              )}
              {source === "library" && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {["Nocturne Drive", "Glass Horizon", "Cipher Room", "The Long Reel"].map(
                    (title, i) => (
                      <button
                        key={title}
                        type="button"
                        className="group relative aspect-[2/3] overflow-hidden rounded-lg border border-white/10 transition-transform hover:-translate-y-1"
                        style={{
                          background: `linear-gradient(160deg, hsl(${i * 70 + 260} 70% 45% / 0.6), hsl(${i * 70 + 320} 70% 35% / 0.5))`,
                        }}
                      >
                        <span className="absolute inset-x-0 bottom-0 bg-black/50 p-1.5 text-left text-[10px] leading-tight text-white">
                          {title}
                        </span>
                      </button>
                    )
                  )}
                </div>
              )}
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

            <div className="divide-y divide-white/10 rounded-xl bg-white/[0.03] px-4">
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
