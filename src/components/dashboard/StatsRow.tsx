import { Clock3, Film, Users } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

const stats = [
  { icon: Film, label: "Rooms hosted", value: "18" },
  { icon: Clock3, label: "Hours watched", value: "142" },
  { icon: Users, label: "Friends connected", value: "26" },
];

export function StatsRow() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {stats.map((stat) => (
        <GlassPanel key={stat.label} className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/10 text-accent">
            <stat.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold leading-tight">{stat.value}</p>
            <p className="truncate text-xs text-muted">{stat.label}</p>
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}
