"use client";

import { useEffect, useRef, useState } from "react";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Rewind,
  FastForward,
  Volume2,
  VolumeX,
  Settings2,
  Loader2,
} from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Participant } from "@/types";

const DURATION = 7320;
const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function VideoPlayer({ participants }: { participants: Participant[] }) {
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(2734);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgress((p) => (p >= DURATION ? DURATION : p + speed));
    }, 1000);
    return () => clearInterval(id);
  }, [playing, speed]);

  function resetHideTimer() {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }

  function togglePlay() {
    setPlaying((v) => !v);
    if (!playing) {
      setBuffering(true);
      setTimeout(() => setBuffering(false), 500);
    }
  }

  function toggleFullscreen() {
    setFullscreen((v) => !v);
  }

  function fireReaction(emoji: string) {
    setReaction(emoji);
    setTimeout(() => setReaction(null), 1200);
  }

  const watchingWithCamera = participants.filter((p) => p.cameraOn);

  return (
    <div
      ref={containerRef}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => setShowControls(playing ? false : true)}
      className={cn(
        "group relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/60",
        fullscreen && "fixed inset-0 z-50 aspect-auto rounded-none"
      )}
    >
      {/* Fake movie frame */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(76,29,149,0.55), rgba(190,24,93,0.35)), radial-gradient(circle at 30% 25%, rgba(255,255,255,0.1), transparent 55%), #050507",
        }}
      />
      <div className="bg-noise absolute inset-0" />

      {/* Center title watermark */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Now playing</p>
        <p className="text-2xl font-semibold text-white/70 sm:text-3xl">Nocturne Drive</p>
      </div>

      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Loader2 className="h-10 w-10 animate-spin text-white/80" />
        </div>
      )}

      {reaction && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center">
          <span className="animate-fade-in-up text-5xl">{reaction}</span>
        </div>
      )}

      {/* Camera strip */}
      {watchingWithCamera.length > 0 && (
        <div className="absolute right-3 top-3 flex flex-col gap-2 sm:right-4 sm:top-4">
          {watchingWithCamera.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="glass-strong relative flex h-16 w-24 items-center justify-center rounded-lg sm:h-20 sm:w-28"
              style={{
                background: `linear-gradient(160deg, rgba(139,92,246,0.35), rgba(236,72,153,0.25))`,
              }}
            >
              <Avatar name={p.name} color={p.avatarColor} size="sm" />
              <span className="absolute bottom-1 left-1.5 text-[10px] text-white/80">
                {p.name.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Top gradient + live badge */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 flex items-center gap-2 bg-gradient-to-b from-black/60 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <span className="flex items-center gap-1.5 rounded-full bg-danger/90 px-2.5 py-1 text-[11px] font-semibold uppercase text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          Synced
        </span>
      </div>

      {/* Center play button */}
      {!playing && !buffering && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-transform hover:scale-110">
            <Play className="ml-1.5 h-8 w-8 fill-white text-white" />
          </span>
        </button>
      )}

      {/* Quick reactions */}
      <div
        className={cn(
          "absolute bottom-24 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/40 px-2 py-1.5 backdrop-blur-md transition-opacity duration-300 sm:bottom-28",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {["❤️", "😂", "😮", "👏", "🔥"].map((emoji) => (
          <button
            key={emoji}
            onClick={() => fireReaction(emoji)}
            className="rounded-full p-1.5 text-lg transition-transform hover:scale-125"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Bottom controls */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-3 pt-10 transition-opacity duration-300 sm:px-5 sm:pb-4",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Seek bar */}
        <div className="mb-2 flex items-center gap-3">
          <span className="w-10 shrink-0 text-right text-xs text-white/70 tabular-nums">
            {formatTime(progress)}
          </span>
          <input
            type="range"
            min={0}
            max={DURATION}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full"
            style={{
              background: `linear-gradient(to right, #c084fc ${(progress / DURATION) * 100}%, rgba(255,255,255,0.2) 0%)`,
            }}
          />
          <span className="w-10 shrink-0 text-xs text-white/70 tabular-nums">
            {formatTime(DURATION)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setProgress((p) => Math.max(0, p - 10))}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
            >
              <Rewind className="h-4 w-4" />
            </button>
            <button
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
            >
              {playing ? (
                <Pause className="h-4 w-4 fill-black" />
              ) : (
                <Play className="ml-0.5 h-4 w-4 fill-black" />
              )}
            </button>
            <button
              onClick={() => setProgress((p) => Math.min(DURATION, p + 10))}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
            >
              <FastForward className="h-4 w-4" />
            </button>

            <div className="hidden items-center gap-1.5 pl-1 sm:flex">
              <button
                onClick={() => setMuted((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  setMuted(false);
                }}
                className="w-20"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu((v) => !v)}
                className="flex h-9 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-white transition-colors hover:bg-white/15"
              >
                <Settings2 className="h-3.5 w-3.5" />
                {speed}x
              </button>
              {showSpeedMenu && (
                <div className="glass-strong absolute bottom-11 right-0 w-24 overflow-hidden rounded-xl p-1 animate-fade-in-up">
                  {speeds.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSpeed(s);
                        setShowSpeedMenu(false);
                      }}
                      className={cn(
                        "block w-full rounded-lg px-3 py-1.5 text-left text-xs",
                        s === speed ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10"
                      )}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={toggleFullscreen}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
            >
              {fullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
