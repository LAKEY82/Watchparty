"use client";

import { useState } from "react";
import { Ban, Crown, LogOut, Trash2 } from "lucide-react";
import { Modal } from "@/components/room/Modal";
import { Switch } from "@/components/ui/Switch";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Participant } from "@/types";
import { cn } from "@/lib/utils";

const tabs = ["General", "Members", "Playback"] as const;

export function SettingsModal({
  open,
  onClose,
  roomTitle,
  participants,
  isHost = false,
  onDeleteRoom,
}: {
  open: boolean;
  onClose: () => void;
  roomTitle: string;
  participants: Participant[];
  isHost?: boolean;
  onDeleteRoom?: () => void;
}) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("General");
  const [title, setTitle] = useState(roomTitle);
  const [locked, setLocked] = useState(false);
  const [allowGuestControl, setAllowGuestControl] = useState(true);
  const [allowChat, setAllowChat] = useState(true);
  const [autoplayNext, setAutoplayNext] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <Modal open={open} onClose={onClose} title="Room settings">
      <div className="mb-5 flex gap-1 rounded-xl bg-white/5 p-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors",
              tab === t ? "bg-white/10 text-foreground" : "text-muted hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "General" && (
        <div className="space-y-1">
          <div className="mb-4">
            <Label htmlFor="room-title">Room name</Label>
            <Input id="room-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="divide-y divide-white/10">
            <Switch
              checked={locked}
              onChange={setLocked}
              label="Lock room"
              description="Prevent new guests from joining"
            />
            <Switch
              checked={allowChat}
              onChange={setAllowChat}
              label="Enable chat"
              description="Guests can send messages"
            />
            <Switch
              checked={allowGuestControl}
              onChange={setAllowGuestControl}
              label="Guest playback control"
              description="Let anyone play, pause, or seek"
            />
          </div>
          {isHost && (
            <div className="mt-5">
              {confirmingDelete ? (
                <div className="space-y-2">
                  <p className="text-center text-xs text-muted">
                    This permanently deletes the room and its chat history for everyone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setConfirmingDelete(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="danger" className="flex-1" onClick={onDeleteRoom}>
                      <Trash2 className="h-4 w-4" /> Confirm delete
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => setConfirmingDelete(true)}
                >
                  <Trash2 className="h-4 w-4" /> Delete room
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "Members" && (
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5">
              <Avatar name={p.name} color={p.avatarColor} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium">{p.name}</span>
                  {p.isHost && <Crown className="h-3 w-3 shrink-0 text-warning" />}
                </div>
                <p className="text-xs text-muted capitalize">{p.status}</p>
              </div>
              {!p.isHost && (
                <div className="flex items-center gap-1">
                  <button className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-warning">
                    <Ban className="h-3.5 w-3.5" />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger/15 hover:text-danger">
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "Playback" && (
        <div className="divide-y divide-white/10">
          <Switch
            checked={autoplayNext}
            onChange={setAutoplayNext}
            label="Autoplay next episode"
            description="Continue automatically when this ends"
          />
          <Switch checked={true} onChange={() => {}} label="Sync tolerance: strict" description="Re-sync guests drifting more than 0.5s" />
        </div>
      )}
    </Modal>
  );
}
