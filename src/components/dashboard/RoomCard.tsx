import Link from "next/link";
import { Play, RotateCcw, Users2 } from "lucide-react";
import { GlassPanel, Badge } from "@/components/ui/GlassPanel";
import { Avatar } from "@/components/ui/Avatar";
import { Room } from "@/types";

export function RoomCard({ room, index = 0 }: { room: Room; index?: number }) {
  return (
    <GlassPanel
      className="group overflow-hidden opacity-0 animate-fade-in-up transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.07]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="relative aspect-video" style={{ background: room.poster }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {room.isLive && (
          <Badge variant="live" className="absolute left-3 top-3">
            <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
            Live
          </Badge>
        )}

        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
          <Users2 className="h-3 w-3" />
          {room.participantCount}
        </div>

        <Link
          href={`/room/${room.id}`}
          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform hover:scale-110">
            <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
          </span>
        </Link>

        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
            style={{ width: `${room.progress * 100}%` }}
          />
        </div>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="truncate font-semibold">{room.title}</h3>
        </div>
        <p className="mb-3 truncate text-sm text-muted">{room.movieTitle}</p>

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {room.participants.slice(0, 4).map((p) => (
              <Avatar key={p.id} name={p.name} color={p.avatarColor} size="xs" ring />
            ))}
          </div>
          <span className="text-xs text-muted">{room.lastActive}</span>
        </div>

        <Link
          href={`/room/${room.id}`}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/10"
        >
          {room.isLive ? (
            <>
              <Play className="h-3.5 w-3.5" /> Rejoin room
            </>
          ) : (
            <>
              <RotateCcw className="h-3.5 w-3.5" /> Resume
            </>
          )}
        </Link>
      </div>
    </GlassPanel>
  );
}
