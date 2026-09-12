import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("group flex items-center gap-2 select-none", className)}>
      <Image
        src="/Images/watchly-mark.png"
        alt=""
        width={32}
        height={32}
        className="h-8 w-8"
        priority
      />
      <span className="text-lg font-semibold tracking-tight">
        Watch<span className="text-gradient">ly</span>
      </span>
    </span>
  );
}
