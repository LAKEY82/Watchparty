"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare, X } from "lucide-react";
import { RoomHeader } from "@/components/room/RoomHeader";
import { VideoPlayer } from "@/components/room/VideoPlayer";
import { ChatSidebar } from "@/components/room/ChatSidebar";
import { MediaDock } from "@/components/room/MediaDock";
import { ShareModal } from "@/components/room/ShareModal";
import { SettingsModal } from "@/components/room/SettingsModal";
import { useRequireAuth } from "@/hooks/useAuth";
import { useMovieWebRTC } from "@/hooks/useMovieWebRTC";
import { ApiError, deleteRoom, getMessages, getRoom } from "@/lib/api";
import { mapApiMessage, mapApiParticipant } from "@/lib/mappers";
import { getSocket } from "@/lib/socket";
import type { ApiMessage, ChatMessage, Participant, PlaybackState, SyncSnapshot } from "@/types";

const SYNC_POLL_INTERVAL_MS = 15_000;

interface AckResponse {
  ok: boolean;
  error?: string;
  state?: PlaybackState;
  serverTime?: number;
}

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId: code } = use(params);
  const router = useRouter();
  const { token, user, ready } = useRequireAuth();

  const [title, setTitle] = useState("");
  const [movieName, setMovieName] = useState("");
  const [movieSource, setMovieSource] = useState("");
  const [sourceType, setSourceType] = useState<"url" | "upload" | "library">("url");
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [syncAnchor, setSyncAnchor] = useState<SyncSnapshot | null>(null);
  const [playbackEventId, setPlaybackEventId] = useState(0);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const socket = token ? getSocket(token) : null;

  // Lives here (rather than inside VideoPlayer) because the "host mutes a
  // specific guest" control needs to live in the participant list
  // (ChatSidebar), not just over the video itself.
  const {
    streaming,
    supported,
    setLocalMuted,
    mutedGuestIds,
    setGuestAudioMuted,
    hostMutedMe,
  } = useMovieWebRTC({
    socket,
    roomCode: code,
    isHost,
    userId: user?.id || null,
    token,
    videoRef,
  });

  const applyAnchor = useCallback((state: PlaybackState, serverTime: number, isEvent: boolean) => {
    setSyncAnchor({ state, serverTime, receivedAt: Date.now() });
    if (isEvent) setPlaybackEventId((n) => n + 1);
  }, []);

  // Room metadata (title, movie name, who the host is, participant list)
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    getRoom(token, code)
      .then((data) => {
        if (cancelled) return;
        setTitle(data.room.title);
        setMovieName(data.room.movieName);
        setMovieSource(data.room.movieSource);
        setSourceType(data.room.sourceType);
        setIsHost(Boolean(user && data.room.host.id === user.id));
        setParticipants(data.room.participants.map(mapApiParticipant));
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Couldn't load this room.");
      })
      .finally(() => {
        if (!cancelled) setLoadingRoom(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, code, user]);

  // Chat history — fetched once on entry so a message sent before this
  // client joined (or before a page refresh) still shows up. New messages
  // after that arrive over the socket, in the join-room effect below.
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    getMessages(token, code)
      .then((data) => {
        if (cancelled) return;
        setMessages(data.messages.map(mapApiMessage));
      })
      .catch(() => {
        // Non-fatal — chat still works for anything sent from here on.
      });

    return () => {
      cancelled = true;
    };
  }, [token, code]);

  function refreshParticipants() {
    if (!token) return;
    getRoom(token, code)
      .then((data) => setParticipants(data.room.participants.map(mapApiParticipant)))
      .catch(() => {
        // best-effort — the participant list will catch up next refresh
      });
  }

  // Socket connection: join the room, listen for other participants'
  // actions, and hand this room's socket to whatever needs it.
  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);

    socket.emit("join-room", code, (ack: AckResponse) => {
      if (!ack.ok || !ack.state || ack.serverTime === undefined) {
        setError(ack.error || "Couldn't connect to this room's live session.");
        return;
      }
      applyAnchor(ack.state, ack.serverTime, true);
    });

    function onUserJoined() {
      refreshParticipants();
    }
    function onUserLeft() {
      refreshParticipants();
    }
    function onPlaybackBroadcast(payload: { state: PlaybackState; serverTime: number }) {
      applyAnchor(payload.state, payload.serverTime, true);
    }
    function onChatMessage(payload: ApiMessage) {
      setMessages((prev) => [...prev, mapApiMessage(payload)]);
    }

    socket.on("user-joined", onUserJoined);
    socket.on("user-left", onUserLeft);
    socket.on("play", onPlaybackBroadcast);
    socket.on("pause", onPlaybackBroadcast);
    socket.on("seek", onPlaybackBroadcast);
    socket.on("chat-message", onChatMessage);

    return () => {
      socket.off("user-joined", onUserJoined);
      socket.off("user-left", onUserLeft);
      socket.off("play", onPlaybackBroadcast);
      socket.off("pause", onPlaybackBroadcast);
      socket.off("seek", onPlaybackBroadcast);
      socket.off("chat-message", onChatMessage);
      socket.emit("leave-room", {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, code]);

  // Periodically (and on refocusing the tab) ask the server for a fresh
  // snapshot. This doesn't force a hard seek by itself — it just refines
  // what the drift-correction loop is comparing against — but it's what
  // recovers a tab that was backgrounded (and had its timers throttled)
  // from having quietly drifted far out of sync.
  useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);

    function requestSync() {
      socket.emit("sync-request", {}, (ack: AckResponse) => {
        if (ack.ok && ack.state && ack.serverTime !== undefined) {
          applyAnchor(ack.state, ack.serverTime, false);
        }
      });
    }

    const interval = setInterval(requestSync, SYNC_POLL_INTERVAL_MS);
    function onVisibilityChange() {
      if (document.visibilityState === "visible") requestSync();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [token, code, applyAnchor]);

  function handleLocalPlay(position: number) {
    if (!token) return;
    getSocket(token).emit("play", { position }, (ack: AckResponse) => {
      if (!ack.ok) setError(ack.error || "Couldn't start playback for everyone.");
    });
  }

  function handleLocalPause(position: number) {
    if (!token) return;
    getSocket(token).emit("pause", { position }, (ack: AckResponse) => {
      if (!ack.ok) setError(ack.error || "Couldn't pause for everyone.");
    });
  }

  function handleLocalSeek(position: number, playbackRate?: number) {
    if (!token) return;
    getSocket(token).emit("seek", { position, playbackRate }, (ack: AckResponse) => {
      if (!ack.ok) setError(ack.error || "Couldn't sync that change.");
    });
  }

  function handleSendMessage(text: string) {
    if (!token) return;
    getSocket(token).emit("chat-message", { text }, (ack: AckResponse) => {
      if (!ack.ok) setError(ack.error || "Couldn't send that message.");
    });
  }

  async function handleDeleteRoom() {
    if (!token) return;
    try {
      await deleteRoom(token, code);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete this room.");
    }
  }

  const canControl = Boolean(
    syncAnchor &&
      user &&
      (syncAnchor.state.hostId === user.id || syncAnchor.state.allowGuestControl)
  );

  if (!ready || loadingRoom) {
    return (
      <div className="bg-cinema flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="bg-cinema flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-danger">{error}</p>
        <Link href="/dashboard" className="text-sm text-accent hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-cinema flex h-screen flex-col overflow-hidden">
      {error && title && (
        <div className="flex items-center justify-between gap-3 bg-danger/15 px-4 py-2 text-sm text-danger">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <RoomHeader
        title={title}
        code={code}
        participants={participants}
        onShare={() => setShareOpen(true)}
        onSettings={() => setSettingsOpen(true)}
        onShowPeople={() => setMobileChatOpen(true)}
      />

      <div className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:flex-row sm:p-6">
        <div className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-4 sm:flex-row">
          <div className="relative w-full">
           <VideoPlayer
              participants={participants}
              movieName={movieName}
              movieSource={movieSource}
              sourceType={sourceType}
              canControl={canControl}
              syncAnchor={syncAnchor}
              playbackEventId={playbackEventId}
              onLocalPlay={handleLocalPlay}
              onLocalPause={handleLocalPause}
              onLocalSeek={handleLocalSeek}
              roomCode={code}
              isHost={isHost}
              videoRef={videoRef}
              streaming={streaming}
              supported={supported}
              hostMutedMe={hostMutedMe}
              setLocalMuted={setLocalMuted}
            />

            <div className="pointer-events-none absolute inset-x-0 top-full mt-4 hidden justify-center sm:flex">
              <div className="pointer-events-auto">
                <MediaDock
                  micOn={micOn}
                  cameraOn={cameraOn}
                  onToggleMic={() => setMicOn((v) => !v)}
                  onToggleCamera={() => setCameraOn((v) => !v)}
                  onOpenSettings={() => setSettingsOpen(true)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center sm:hidden">
            <MediaDock
              micOn={micOn}
              cameraOn={cameraOn}
              onToggleMic={() => setMicOn((v) => !v)}
              onToggleCamera={() => setCameraOn((v) => !v)}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden w-90 shrink-0 lg:block">
          <ChatSidebar
            participants={participants}
            isHost={isHost}
            currentUserId={user?.id}
            mutedGuestIds={mutedGuestIds}
            onToggleGuestMute={setGuestAudioMuted}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* Mobile chat toggle */}
        <button
          onClick={() => setMobileChatOpen(true)}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-foreground backdrop-blur-md lg:hidden"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile chat drawer */}
      {mobileChatOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileChatOpen(false)}
          />
          <div className="relative flex h-full w-full max-w-sm flex-col p-3 animate-fade-in-up">
            <button
              onClick={() => setMobileChatOpen(false)}
              className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <ChatSidebar
            participants={participants}
            isHost={isHost}
            currentUserId={user?.id}
            mutedGuestIds={mutedGuestIds}
            onToggleGuestMute={setGuestAudioMuted}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
          </div>
        </div>
      )}

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} roomCode={code} />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        roomTitle={title}
        participants={participants}
        isHost={isHost}
        onDeleteRoom={handleDeleteRoom}
      />
    </div>
  );
}
