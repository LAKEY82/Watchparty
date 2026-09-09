import { Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("group flex items-center gap-2 select-none", className)}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30">
        <Clapperboard className="h-4 w-4 text-white" strokeWidth={2.25} />
      </span>
      <span className="text-lg font-semibold tracking-tight">
        Reel<span className="text-gradient">Sync</span>
      </span>
    </span>
  );
}
