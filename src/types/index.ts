export type ParticipantStatus = "watching" | "away" | "buffering";

export interface Participant {
  id: string;
  name: string;
  avatarColor: string;
  isHost?: boolean;
  micOn: boolean;
  cameraOn: boolean;
  status: ParticipantStatus;
}

export interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  avatarColor: string;
  message: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface Room {
  id: string;
  code: string;
  title: string;
  movieTitle: string;
  poster: string;
  participants: Participant[];
  participantCount: number;
  duration: number;
  progress: number;
  isLive: boolean;
  lastActive: string;
}
