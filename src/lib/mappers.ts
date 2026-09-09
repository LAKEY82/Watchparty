import { avatarColors } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/utils";
import type { ApiParticipant, ApiRoom, Participant, Room } from "@/types";

// A fixed, small palette — picked by hash below — so these are plain
// Tailwind arbitrary-value utilities (applied via className) rather than
// runtime CSS strings passed through a style prop.
const posterGradients = [
  "[background:linear-gradient(135deg,rgba(139,92,246,0.55),rgba(236,72,153,0.35)),radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]",
  "[background:linear-gradient(135deg,rgba(99,102,241,0.55),rgba(16,185,129,0.3)),radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.12),transparent_60%)]",
  "[background:linear-gradient(135deg,rgba(244,63,94,0.5),rgba(217,70,239,0.35)),radial-gradient(circle_at_20%_70%,rgba(255,255,255,0.12),transparent_60%)]",
  "[background:linear-gradient(135deg,rgba(245,158,11,0.5),rgba(239,68,68,0.3)),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.12),transparent_60%)]",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function mapApiParticipant(participant: ApiParticipant): Participant {
  const { user } = participant;
  return {
    id: user.id,
    name: user.name,
    avatarColor: user.avatarColor || avatarColors[hashString(user.id) % avatarColors.length],
    isHost: participant.isHost,
    micOn: participant.micOn,
    cameraOn: participant.cameraOn,
    status: "watching",
  };
}

export function mapApiRoom(room: ApiRoom): Room {
  const participants = room.participants.map(mapApiParticipant);

  return {
    id: room.code,
    code: room.code,
    title: room.title,
    movieTitle: room.movieName || room.movieSource || "No movie selected yet",
    posterClassName: posterGradients[hashString(room.code) % posterGradients.length],
    participants,
    participantCount: participants.length,
    duration: 0,
    progress: 0,
    isLive: room.playback.isPlaying,
    lastActive: room.playback.isPlaying ? "Live now" : formatRelativeTime(room.updatedAt),
  };
}
