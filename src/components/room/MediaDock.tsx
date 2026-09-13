"use client";

import Link from "next/link";
import {
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Settings,
  Video,
  VideoOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MediaDock({
  micOn,
  cameraOn,
  onToggleMic,
  onToggleCamera,
  onOpenSettings,
}: {
  micOn: boolean;
  cameraOn: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <div className="glass-strong flex items-center gap-1.5 rounded-2xl p-2 shadow-2xl shadow-black/15 sm:gap-2">
      <DockButton active={micOn} onClick={onToggleMic} label={micOn ? "Mute mic" : "Unmute mic"}>
        {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
      </DockButton>

      <DockButton
        active={cameraOn}
        onClick={onToggleCamera}
        label={cameraOn ? "Turn off camera" : "Turn on camera"}
      >
        {cameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
      </DockButton>

      <DockButton active={false} onClick={() => {}} label="Share screen">
        <MonitorUp className="h-4 w-4" />
      </DockButton>

      <DockButton active={false} onClick={onOpenSettings} label="Room settings">
        <Settings className="h-4 w-4" />
      </DockButton>

      <div className="mx-1 h-6 w-px bg-black/10" />

      <Link
        href="/dashboard"
        className="flex h-11 items-center gap-2 rounded-xl bg-danger px-4 text-sm font-medium text-white transition-transform hover:scale-[1.03] active:scale-95"
      >
        <PhoneOff className="h-4 w-4" />
        <span className="hidden sm:inline">Leave</span>
      </Link>
    </div>
  );
}

function DockButton({
  active,
  onClick,
  children,
  label,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-xl transition-all",
        active ? "bg-black/10 text-foreground hover:bg-black/15" : "bg-danger/90 text-white hover:bg-danger"
      )}
    >
      {children}
    </button>
  );
}
