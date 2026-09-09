import Link from "next/link";
import { ArrowRight, Play, Users2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/GlassPanel";
import { Avatar } from "@/components/ui/Avatar";
import { avatarColors } from "@/lib/mock-data";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-40 sm:pt-48">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-140 w-225 -translate-x-1/2 animate-float rounded-full [background:radial-gradient(closest-side,rgba(139,92,246,0.35),rgba(236,72,153,0.15),transparent)] opacity-40 blur-3xl" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 text-center">
        <div className="animate-fade-in-up opacity-0 [animation-delay:0ms]">
          <Badge variant="outline" className="mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Frame-perfect sync, everywhere
          </Badge>
        </div>

        <h1 className="animate-fade-in-up text-balance text-4xl font-semibold leading-[1.1] tracking-tight opacity-0 [animation-delay:80ms] sm:text-6xl">
          Watch movies together,
          <br />
          <span className="text-gradient">no matter the distance</span>
        </h1>

        <p className="mt-6 max-w-xl text-balance text-base text-muted opacity-0 animate-fade-in-up [animation-delay:160ms] sm:text-lg">
          Create a room, share a link, and press play. ReelSync keeps everyone
          in perfect sync with live chat, voice, and video — like you&apos;re
          in the same room.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 opacity-0 animate-fade-in-up [animation-delay:240ms] sm:flex-row">
          <Link href="/register">
            <Button size="lg" className="group">
              Start a watch party
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Link href="/join-room">
            <Button size="lg" variant="secondary">
              Join a room
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex items-center gap-3 opacity-0 animate-fade-in-up [animation-delay:320ms]">
          <div className="flex -space-x-2.5">
            {avatarColors.slice(0, 5).map((c, i) => (
              <Avatar key={i} name={String.fromCharCode(65 + i)} color={c} size="sm" ring />
            ))}
          </div>
          <p className="text-sm text-muted">
            <span className="font-medium text-foreground">12,400+</span> parties hosted this week
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="relative mx-auto mt-16 max-w-5xl px-4 opacity-0 animate-fade-in-up [animation-delay:400ms]">
        <div className="glass-strong overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
            </div>
            <Badge variant="live">
              <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
              Live
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Users2 className="h-3.5 w-3.5" />5 watching
            </div>
          </div>

          <div className="relative flex aspect-video items-center justify-center [background:linear-gradient(135deg,rgba(139,92,246,0.45),rgba(236,72,153,0.25)),radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.12),transparent_60%)]">
            <button className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-transform hover:scale-110">
              <Play className="ml-1 h-6 w-6 fill-white text-white" />
            </button>

            <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-5 py-4">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400" />
              </div>
              <span className="text-xs text-white/80">31:12 / 74:00</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
