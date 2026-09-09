"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { RoomCard } from "@/components/dashboard/RoomCard";
import { useRequireAuth } from "@/hooks/useAuth";
import { ApiError, listRooms } from "@/lib/api";
import { mapApiRoom } from "@/lib/mappers";
import type { Room } from "@/types";

export default function DashboardPage() {
  const { user, token, ready, logout } = useRequireAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    listRooms(token)
      .then((data) => {
        if (cancelled) return;
        setRooms(data.rooms.map(mapApiRoom));
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Couldn't load your rooms.");
      })
      .finally(() => {
        if (!cancelled) setLoadingRooms(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!ready) {
    return (
      <div className="bg-cinema flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  const liveRooms = rooms.filter((r) => r.isLive);
  const recentRooms = rooms.filter((r) => !r.isLive);

  return (
    <div className="bg-cinema min-h-screen">
      <DashboardNav user={user} onLogout={logout} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Ready for another movie night? Create a room or jump back into one.
          </p>
        </div>

        <div className="mb-8">
          <QuickActions />
        </div>

        <div className="mb-8">
          <StatsRow />
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {loadingRooms ? (
          <div className="flex items-center justify-center py-16 text-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <>
            {liveRooms.length > 0 && (
              <section className="mb-10">
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Live now</h2>
                  <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {liveRooms.map((room, i) => (
                    <RoomCard key={room.id} room={room} index={i} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent rooms</h2>
              </div>
              {recentRooms.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {recentRooms.map((room, i) => (
                    <RoomCard key={room.id} room={room} index={i} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-sm text-muted">
                  No rooms yet — create one or join with a room code to get started.
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
