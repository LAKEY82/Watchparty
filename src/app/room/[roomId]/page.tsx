"use client";

import { useState } from "react";
import { use } from "react";
import { MessageSquare, X } from "lucide-react";
import { RoomHeader } from "@/components/room/RoomHeader";
import { VideoPlayer } from "@/components/room/VideoPlayer";
import { ChatSidebar } from "@/components/room/ChatSidebar";
import { MediaDock } from "@/components/room/MediaDock";
import { ShareModal } from "@/components/room/ShareModal";
import { SettingsModal } from "@/components/room/SettingsModal";
import { mockParticipants, mockRooms } from "@/lib/mock-data";

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const room = mockRooms.find((r) => r.id === roomId);

  const [participants] = useState(mockParticipants);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const title = room?.title ?? "Friday Movie Night";
  const code = room?.code ?? "NEON-482";

  return (
    <div className="bg-cinema flex h-screen flex-col overflow-hidden">
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
            <VideoPlayer participants={participants} />

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
          <ChatSidebar participants={participants} />
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
            <ChatSidebar participants={participants} />
          </div>
        </div>
      )}

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} roomCode={code} />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        roomTitle={title}
        participants={participants}
      />
    </div>
  );
}
