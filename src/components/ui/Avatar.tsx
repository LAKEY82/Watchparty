import { Mic, MicOff, Crown } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { Participant } from "@/types";

interface AvatarProps {
  name: string;
  color: string;
  size?: "xs" | "sm" | "md" | "lg";
  ring?: boolean;
  className?: string;
}

const sizeMap = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

export function Avatar({ name, color, size = "md", ring, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white",
        color,
        sizeMap[size],
        ring && "ring-2 ring-background",
        className
      )}
    >
      {initials(name)}
    </div>
  );
}

export function ParticipantAvatar({
  participant,
  size = "md",
}: {
  participant: Participant;
  size?: AvatarProps["size"];
}) {
  return (
    <div className="group relative flex flex-col items-center gap-1.5">
      <div className="relative">
        <Avatar name={participant.name} color={participant.avatarColor} size={size} ring />
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background",
            participant.status === "watching" && "bg-success",
            participant.status === "away" && "bg-muted",
            participant.status === "buffering" && "bg-warning animate-pulse"
          )}
        />
        {participant.isHost && (
          <span className="absolute -top-1.5 -left-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-warning text-background">
            <Crown className="h-2.5 w-2.5" strokeWidth={3} />
          </span>
        )}
        <span
          className={cn(
            "absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background",
            participant.micOn ? "bg-emerald-500" : "bg-white/20"
          )}
        >
          {participant.micOn ? (
            <Mic className="h-2 w-2 text-white" strokeWidth={3} />
          ) : (
            <MicOff className="h-2 w-2 text-white" strokeWidth={3} />
          )}
        </span>
      </div>
      <span className="max-w-[64px] truncate text-[11px] text-muted">
        {participant.name}
      </span>
    </div>
  );
}
