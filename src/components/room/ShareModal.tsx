"use client";

import { useState } from "react";
import { Check, Copy, Mail, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/room/Modal";

export function ShareModal({
  open,
  onClose,
  roomCode,
}: {
  open: boolean;
  onClose: () => void;
  roomCode: string;
}) {
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const link = `watchly.app/join/${roomCode}`;

  function copy(value: string, setter: (v: boolean) => void) {
    navigator.clipboard?.writeText(value).catch(() => {});
    setter(true);
    setTimeout(() => setter(false), 1500);
  }

  return (
    <Modal open={open} onClose={onClose} title="Share this room">
      <p className="mb-5 text-sm text-muted">
        Anyone with this link or code can join instantly.
      </p>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-muted">Invite link</label>
        <div className="flex items-center gap-2">
          <div className="flex h-11 flex-1 items-center truncate rounded-xl border border-black/10 bg-black/5 px-3.5 text-sm text-foreground/90">
            {link}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="rounded-xl!"
            onClick={() => copy(link, setCopied)}
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-1.5 block text-xs font-medium text-muted">Room code</label>
        <div className="flex items-center gap-2">
          <div className="flex h-11 flex-1 items-center justify-center rounded-xl border border-black/10 bg-black/5 text-lg font-semibold tracking-[0.3em] text-foreground">
            {roomCode}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="rounded-xl!"
            onClick={() => copy(roomCode, setCodeCopied)}
          >
            {codeCopied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button className="flex flex-col items-center gap-1.5 rounded-xl border border-black/10 py-3 text-xs text-muted transition-colors hover:bg-black/5 hover:text-foreground">
          <MessageCircle className="h-4 w-4" /> Message
        </button>
        <button className="flex flex-col items-center gap-1.5 rounded-xl border border-black/10 py-3 text-xs text-muted transition-colors hover:bg-black/5 hover:text-foreground">
          <Mail className="h-4 w-4" /> Email
        </button>
        <button className="flex flex-col items-center gap-1.5 rounded-xl border border-black/10 py-3 text-xs text-muted transition-colors hover:bg-black/5 hover:text-foreground">
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>
    </Modal>
  );
}
