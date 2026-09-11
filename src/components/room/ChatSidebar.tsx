"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Crown,
  Mic,
  MicOff,
  Send,
  Smile,
  Users,
  Video,
  VideoOff,
  MessageSquare,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { ChatMessage, Participant } from "@/types";

const quickEmojis = ["😂", "❤️", "🔥", "😮", "👏", "🍿"];

interface ChatSidebarProps {
  participants: Participant[];
  // The following are only meaningful for the movie's audio stream, not
  // the mic/camera icons above — they let the HOST silence a specific
  // guest's copy of the movie sound without touching anyone else's (see
  // useMovieWebRTC's setGuestAudioMuted). Omitted entirely for a guest
  // viewing this list, since only the host can do this.
  isHost?: boolean;
  currentUserId?: string | null;
  mutedGuestIds?: Set<string>;
  onToggleGuestMute?: (guestUserId: string, muted: boolean) => void;
  // Chat itself: history + realtime messages live in RoomPage (it owns the
  // socket connection), sent back down here rather than mocked locally.
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export function ChatSidebar({
  participants,
  isHost = false,
  currentUserId,
  mutedGuestIds,
  onToggleGuestMute,
  messages,
  onSendMessage,
}: ChatSidebarProps) {
  const [tab, setTab] = useState<"chat" | "people">("chat");
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function sendMessage(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSendMessage(text);
    setDraft("");
  }

  return (
    <div className="glass-strong flex h-full min-h-0 flex-col rounded-2xl">
      <div className="flex shrink-0 items-center gap-1 border-b border-white/10 p-2">
        <button
          onClick={() => setTab("chat")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium transition-colors",
            tab === "chat" ? "bg-white/10 text-foreground" : "text-muted hover:text-foreground"
          )}
        >
          <MessageSquare className="h-4 w-4" /> Chat
        </button>
        <button
          onClick={() => setTab("people")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium transition-colors",
            tab === "people" ? "bg-white/10 text-foreground" : "text-muted hover:text-foreground"
          )}
        >
          <Users className="h-4 w-4" /> People
          <span className="rounded-full bg-white/10 px-1.5 text-xs">{participants.length}</span>
        </button>
      </div>

      {tab === "chat" ? (
        <>
          <div className="flex-1 min-h-0 space-y-4 overflow-y-auto p-4">
            {messages.map((msg) =>
              msg.isSystem ? (
                <p key={msg.id} className="text-center text-xs text-muted">
                  {msg.message}
                </p>
              ) : (
                <div key={msg.id} className="flex items-start gap-2.5 animate-fade-in-up">
                  <Avatar name={msg.authorName} color={msg.avatarColor} size="xs" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium">{msg.authorName}</span>
                      <span className="text-[10px] text-muted">{msg.timestamp}</span>
                    </div>
                    <p className="mt-0.5 break-words text-sm text-foreground/90">{msg.message}</p>
                  </div>
                </div>
              )
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0 border-t border-white/10 p-3">
            <div className="mb-2 flex items-center gap-1">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setDraft((d) => d + emoji)}
                  className="rounded-lg p-1 text-base transition-transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <form onSubmit={sendMessage} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Send a message…"
                  className="h-10 w-full rounded-xl bg-white/5 border border-white/10 pl-3.5 pr-9 text-sm outline-none placeholder:text-muted focus:border-accent/60 focus:bg-white/[0.07]"
                />
                <Smile className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              </div>
              <button
                type="submit"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white transition-transform hover:scale-105 active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 min-h-0 space-y-1 overflow-y-auto p-3">
          {participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-white/5"
            >
              <div className="relative">
                <Avatar name={p.name} color={p.avatarColor} size="sm" />
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                    p.status === "watching" && "bg-success",
                    p.status === "away" && "bg-muted",
                    p.status === "buffering" && "bg-warning animate-pulse"
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium">{p.name}</span>
                  {p.isHost && <Crown className="h-3 w-3 shrink-0 text-warning" />}
                </div>
                <p className="text-xs capitalize text-muted">{p.status}</p>
              </div>
              <div className="flex items-center gap-1.5 text-muted">
                {p.micOn ? <Mic className="h-3.5 w-3.5 text-success" /> : <MicOff className="h-3.5 w-3.5" />}
                {p.cameraOn ? <Video className="h-3.5 w-3.5 text-success" /> : <VideoOff className="h-3.5 w-3.5" />}
                {isHost && !p.isHost && p.id !== currentUserId && onToggleGuestMute && (
                  <button
                    type="button"
                    onClick={() => onToggleGuestMute(p.id, !mutedGuestIds?.has(p.id))}
                    title={
                      mutedGuestIds?.has(p.id)
                        ? `Unmute the movie's audio for ${p.name}`
                        : `Mute the movie's audio for ${p.name}`
                    }
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                      mutedGuestIds?.has(p.id)
                        ? "bg-danger/20 text-danger"
                        : "hover:bg-white/10 hover:text-foreground"
                    )}
                  >
                    {mutedGuestIds?.has(p.id) ? (
                      <VolumeX className="h-3.5 w-3.5" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
