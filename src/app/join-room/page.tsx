"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, KeyRound, Link2 } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { mockRooms } from "@/lib/mock-data";

export default function JoinRoomPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setTimeout(() => router.push("/room/r1"), 600);
  }

  return (
    <div className="bg-cinema min-h-screen px-4 py-10">
      <div className="mx-auto max-w-lg">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Join a room</h1>
          <p className="mt-1 text-sm text-muted">
            Enter a room code or paste an invite link to join instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <GlassPanel className="space-y-5 p-6 sm:p-8">
            <div>
              <Label htmlFor="code">Room code or invite link</Label>
              <Input
                id="code"
                placeholder="e.g. NEON-482"
                icon={<KeyRound className="h-4 w-4" />}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="text-center text-lg font-semibold tracking-widest uppercase"
              />
            </div>

            <Button type="submit" size="lg" className="group w-full" disabled={loading}>
              {loading ? "Joining…" : "Join room"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>

            <div className="flex items-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-3 text-xs text-muted">
              <Link2 className="h-3.5 w-3.5 shrink-0" />
              Room links look like reelsync.app/join/NEON-482
            </div>
          </GlassPanel>
        </form>

        <div className="mt-8">
          <p className="mb-3 text-sm font-medium text-muted">Quick join a recent room</p>
          <div className="space-y-2">
            {mockRooms.slice(0, 3).map((room) => (
              <Link
                key={room.id}
                href={`/room/${room.id}`}
                className="glass flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/[0.08]"
              >
                <div
                  className="h-10 w-10 shrink-0 rounded-lg"
                  style={{ background: room.poster }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{room.title}</p>
                  <p className="truncate text-xs text-muted">{room.code}</p>
                </div>
                <div className="flex -space-x-2">
                  {room.participants.slice(0, 3).map((p) => (
                    <Avatar key={p.id} name={p.name} color={p.avatarColor} size="xs" ring />
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
