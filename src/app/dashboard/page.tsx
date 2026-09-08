import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { RoomCard } from "@/components/dashboard/RoomCard";
import { mockRooms } from "@/lib/mock-data";

export default function DashboardPage() {
  const liveRooms = mockRooms.filter((r) => r.isLive);
  const recentRooms = mockRooms.filter((r) => !r.isLive);

  return (
    <div className="bg-cinema min-h-screen">
      <DashboardNav />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, Jordan</h1>
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
            <button className="text-sm text-accent hover:underline">View all</button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recentRooms.map((room, i) => (
              <RoomCard key={room.id} room={room} index={i} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
