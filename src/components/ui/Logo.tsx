import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  // "light" is for placing the logo directly on a solid accent-colored
  // surface (see AuthLayout's brand panel) — the default mark and "ly"
  // accent-colored text would both disappear against that background.
  variant?: "default" | "light";
}

export function Logo({ className, variant = "default" }: LogoProps) {
  const light = variant === "light";

  return (
    <span className={cn("group flex items-center gap-2 select-none", className)}>
      <Image
        src={light ? "/Images/watchly-mark-white.png" : "/Images/watchly-mark.png"}
        alt=""
        width={32}
        height={32}
        className="h-8 w-8"
        priority
      />
      <span className={cn("text-lg font-semibold tracking-tight", light && "text-white")}>
        Watch<span className={light ? "text-white/80" : "text-accent"}>ly</span>
      </span>
    </span>
  );
}
