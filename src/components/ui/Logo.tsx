import { Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2", className)}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30 transition-transform group-hover:scale-105">
        <Clapperboard className="h-4 w-4 text-white" strokeWidth={2.25} />
      </span>
      <span className="text-lg font-semibold tracking-tight">
        Reel<span className="text-gradient">Sync</span>
      </span>
    </Link>
  );
}
