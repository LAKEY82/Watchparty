"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, KeyRound, Link2, Loader2 } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useRequireAuth } from "@/hooks/useAuth";
import { ApiError, joinRoom, listRooms } from "@/lib/api";
import { mapApiRoom } from "@/lib/mappers";
import { cn } from "@/lib/utils";
import type { Room } from "@/types";

export default function JoinRoomPage() {
  const router = useRouter();
  const { token, ready } = useRequireAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentRooms, setRecentRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (!token) return;
    listRooms(token)
      .then((data) => setRecentRooms(data.rooms.map(mapApiRoom).slice(0, 3)))
      .catch(() => {
        // quiet fail — this list is just a convenience shortcut
      });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !token) return;

    setError(null);
    setLoading(true);

    try {
      const { room } = await joinRoom(token, code.trim());
      router.push(`/room/${room.code}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't join that room.");
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
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="code">Room code or invite link</Label>
              <Input
                id="code"
                placeholder="e.g. NEON482"
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
              Room links look like reelsync.app/join/NEON482
            </div>
          </GlassPanel>
        </form>

        {recentRooms.length > 0 && (
          <div className="mt-8">
            <p className="mb-3 text-sm font-medium text-muted">Quick join a recent room</p>
            <div className="space-y-2">
              {recentRooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/room/${room.code}`}
                  className="glass flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/8"
                >
                  <div className={cn("h-10 w-10 shrink-0 rounded-lg", room.posterClassName)} />
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
        )}
      </div>
    </div>
  );
}
