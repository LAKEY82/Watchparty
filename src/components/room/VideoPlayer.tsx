"use client";

import {
  useEffect,
  useState,
  type RefObject,
} from "react";

import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Upload,
  Loader2,
} from "lucide-react";

import type {
  Participant,
  SyncSnapshot,
} from "@/types";

interface VideoPlayerProps {
  participants: Participant[];
  movieName: string;
  movieSource: string;
  sourceType: "url" | "upload" | "library";
  canControl: boolean;
  syncAnchor: SyncSnapshot | null;
  playbackEventId: number;
  onLocalPlay: (position: number) => void;
  onLocalPause: (position: number) => void;
  onLocalSeek: (
    position: number,
    playbackRate?: number,
  ) => void;
  roomCode?: string;
  isHost: boolean;
  // WebRTC state/controls live one level up (in RoomPage) so the "host
  // mutes a specific guest" control in the participant list and this
  // player can share the same connections — see useMovieWebRTC there.
  videoRef: RefObject<HTMLVideoElement | null>;
  streaming: boolean;
  supported: boolean;
  hostMutedMe: boolean;
  setLocalMuted: (muted: boolean) => void;
}

export function VideoPlayer({
  // Not rendered yet in this simplified player (no camera strip/reactions
  // here) — kept in the prop contract since RoomPage already passes it and
  // a future pass may want it again.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  participants,
  movieName,
  movieSource,
  sourceType,
  canControl,
  syncAnchor,
  playbackEventId,
  onLocalPlay,
  onLocalPause,
  onLocalSeek,
  isHost,
  videoRef,
  streaming,
  supported,
  hostMutedMe,
  setLocalMuted,
}: VideoPlayerProps) {
  const [localFileUrl, setLocalFileUrl] =
    useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [loading, setLoading] = useState(false);

  /*
   * Host selects a local movie.
   */
  function handleFileSelect(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("video/")) {
      alert("Please select a video file.");
      return;
    }

    const url = URL.createObjectURL(file);

    setLocalFileUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }

      return url;
    });

    setLoading(true);
  }

  /*
   * Clean local file URL.
   */
  useEffect(() => {
    return () => {
      if (localFileUrl) {
        URL.revokeObjectURL(localFileUrl);
      }
    };
  }, [localFileUrl]);

  /*
   * Determine what the HOST video should display.
   */
  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    if (!isHost) {
      return;
    }

    if (localFileUrl) {
      videoRef.current.src = localFileUrl;
      videoRef.current.load();

      return;
    }

    if (
      sourceType === "url" &&
      movieSource
    ) {
      videoRef.current.src = movieSource;
      videoRef.current.load();

      return;
    }

    /*
     * Library source can be implemented later.
     */
  }, [
    isHost,
    localFileUrl,
    sourceType,
    movieSource,
    videoRef,
  ]);

  /*
   * Guest should NOT load movieSource.
   *
   * Guest receives the movie through WebRTC.
   */
  useEffect(() => {
    if (isHost) {
      return;
    }

    if (!videoRef.current) {
      return;
    }

    /*
     * Important:
     * Do not set video.src for guests.
     */
    videoRef.current.removeAttribute("src");
  }, [isHost, videoRef]);

  /*
   * Playback synchronization.
   *
   * Only the HOST controls the actual source video.
   */
  useEffect(() => {
    if (!isHost) {
      return;
    }

    const video = videoRef.current;

    if (!video || !syncAnchor) {
      return;
    }

const {
  status,
  position,
  playbackRate = 1,
} = syncAnchor.state;

const serverPlaying = status === "playing";

    const elapsed =
      serverPlaying
        ? (Date.now() -
            syncAnchor.serverTime) /
          1000
        : 0;

    const target =
      Math.max(
        0,
        position + elapsed * playbackRate,
      );

    if (
      Number.isFinite(target) &&
      Math.abs(video.currentTime - target) > 1.5
    ) {
      video.currentTime = target;
    }

    video.playbackRate = playbackRate;

    if (serverPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [
    isHost,
    syncAnchor,
    playbackEventId,
    videoRef,
  ]);

  /*
   * Host playback events.
   */
  function handlePlay() {
    if (!isHost || !canControl) {
      return;
    }

    setIsPlaying(true);

    onLocalPlay(
      videoRef.current?.currentTime || 0,
    );
  }

  function handlePause() {
    if (!isHost || !canControl) {
      return;
    }

    setIsPlaying(false);

    onLocalPause(
      videoRef.current?.currentTime || 0,
    );
  }

  function handleSeek(
    event: React.SyntheticEvent<
      HTMLVideoElement
    >,
  ) {
    if (!isHost || !canControl) {
      return;
    }

    const video =
      event.currentTarget;

    onLocalSeek(
      video.currentTime,
      video.playbackRate,
    );
  }

  function handleLoadedMetadata() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    setDuration(video.duration || 0);
    setLoading(false);
  }

  function handleTimeUpdate() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    setCurrentTime(
      video.currentTime,
    );
  }

  function togglePlay() {
    if (!isHost || !canControl) {
      return;
    }

    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  function toggleMute() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const nextMuted = !video.muted;

    // Before the movie stream exists (no guest has connected yet), the
    // video's own `muted` is what governs local playback. Once it exists,
    // setLocalMuted controls a dedicated gain node instead (see
    // getMovieStream) — video.muted itself becomes irrelevant for what's
    // actually audible then, but keeping it in sync costs nothing and
    // means the icon/UI state has one clear source of truth either way.
    video.muted = nextMuted;
    setLocalMuted(nextMuted);

    setMuted(nextMuted);
  }

  function toggleFullscreen() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }

    video.requestFullscreen().catch(() => {});
  }

  function formatTime(seconds: number) {
    if (!Number.isFinite(seconds)) {
      return "00:00";
    }

    const mins = Math.floor(
      seconds / 60,
    );

    const secs = Math.floor(
      seconds % 60,
    );

    return `${String(mins).padStart(
      2,
      "0",
    )}:${String(secs).padStart(2, "0")}`;
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
      <div className="relative aspect-video w-full">
        <video
          ref={videoRef}
          // transform-gpu + opacity < 1 force this element off Chromium's
          // hardware "overlay" fast path and onto the normal compositor.
          // That path matters on both ends of the stream:
          //  - HOST: HTMLVideoElement.captureStream() can only read frame
          //    data from the normal compositor. If the host's own local
          //    playback is using a hardware overlay (common for big local
          //    video files — it looks completely normal on the host's own
          //    screen), captureStream() silently produces black frames
          //    with no error, even though its dimensions/readyState look
          //    correct — exactly what a guest would then receive.
          //  - GUEST: an overlay-rendered remote video can likewise fail
          //    to composite visually despite readyState 4 and non-zero
          //    dimensions. Same fix, opposite end.
          // The 0.9999 opacity is visually identical to 1 but disqualifies
          // the element from the overlay path, which requires full opacity.
          className="h-full w-full object-contain transform-gpu"
          style={{ opacity: 0.9999 }}
          playsInline
          controls={false}
          muted={false}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeeked={handleSeek}
          onLoadedMetadata={
            handleLoadedMetadata
          }
          onTimeUpdate={
            handleTimeUpdate
          }
        />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}

        {!isHost &&
          !streaming && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />

              <div>
                <p className="text-sm font-medium text-white">
                  Waiting for the host
                </p>

                <p className="mt-1 text-xs text-white/60">
                  {movieName
                    ? `"${movieName}" will appear here once the host starts playing.`
                    : "The host's movie will appear here."}
                </p>
              </div>
            </div>
          )}

        {!isHost &&
          streaming && (
            <>
              <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">
                Live from host
              </div>

              {hostMutedMe && (
                <div className="pointer-events-none absolute left-4 top-12 rounded-full bg-danger/80 px-3 py-1 text-xs text-white backdrop-blur">
                  The host muted your audio
                </div>
              )}

              <button
                type="button"
                onClick={toggleMute}
                title={muted ? "Unmute" : "Mute"}
                className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80"
              >
                {muted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
            </>
          )}
      </div>

      {isHost && (
        <div className="border-t border-white/10 bg-black/90">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              type="button"
              onClick={togglePlay}
              disabled={!canControl}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>

            <span className="text-xs text-white/60">
              {formatTime(currentTime)}
            </span>

            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              disabled={!canControl}
              onChange={(event) => {
                const time =
                  Number(
                    event.target.value,
                  );

                if (!videoRef.current) {
                  return;
                }

                videoRef.current.currentTime =
                  time;

                onLocalSeek(
                  time,
                  videoRef.current
                    .playbackRate,
                );
              }}
              className="flex-1"
            />

            <span className="text-xs text-white/60">
              {formatTime(duration)}
            </span>

            <button
              type="button"
              onClick={toggleMute}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              {muted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {isHost && !localFileUrl && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <label className="pointer-events-auto flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-white/10 bg-black/70 px-8 py-7 text-center backdrop-blur-md transition hover:bg-black/80">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <Upload className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                Select your movie
              </p>

              <p className="mt-1 text-xs text-white/50">
                Only you need to select the file.
              </p>
            </div>

            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </div>
      )}

      {!supported && (
        <div className="absolute bottom-16 left-4 right-4 rounded-lg bg-red-500/90 px-4 py-3 text-xs text-white">
          Your browser does not support
          movie capture streaming.
          Try the latest Chrome or Edge.
        </div>
      )}
    </div>
  );
}