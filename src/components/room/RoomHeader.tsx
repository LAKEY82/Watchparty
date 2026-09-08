"use client";

import Link from "next/link";
import { ArrowLeft, Copy, Settings, Share2, Users2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Participant } from "@/types";

export function RoomHeader({
  title,
  code,
  participants,
  onShare,
  onSettings,
  onShowPeople,
}: {
  title: string;
  code: string;
  participants: Participant[];
  onShare: () => void;
  onSettings: () => void;
  onShowPeople: () => void;
}) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-background/70 px-4 py-3 backdrop-blur-xl sm:px-6">
      <Link
        href="/dashboard"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-sm font-semibold sm:text-base">{title}</h1>
          <Badge variant="live" className="hidden sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
            Live
          </Badge>
        </div>
        <button
          onClick={onShare}
          className="flex items-center gap-1 text-xs text-muted hover:text-foreground"
        >
          {code} <Copy className="h-3 w-3" />
        </button>
      </div>

      <button
        onClick={onShowPeople}
        className="hidden items-center -space-x-2 sm:flex"
      >
        {participants.slice(0, 4).map((p) => (
          <Avatar key={p.id} name={p.name} color={p.avatarColor} size="sm" ring />
        ))}
        {participants.length > 4 && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[11px] font-medium ring-2 ring-background">
            +{participants.length - 4}
          </div>
        )}
      </button>

      <button
        onClick={onShowPeople}
        className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-muted hover:text-foreground sm:hidden"
      >
        <Users2 className="h-3.5 w-3.5" />
        {participants.length}
      </button>

      <Button variant="secondary" size="sm" onClick={onShare} className="hidden sm:inline-flex">
        <Share2 className="h-3.5 w-3.5" /> Share
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onSettings}
        className="border border-white/10"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </header>
  );
}
