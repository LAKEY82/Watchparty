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
  /** A Tailwind arbitrary-property class (e.g. "[background:linear-gradient(...)]"), applied via `className`, not `style`. */
  posterClassName: string;
  participants: Participant[];
  participantCount: number;
  duration: number;
  progress: number;
  isLive: boolean;
  lastActive: string;
}

// Shapes returned by the backend API (src/lib/api.ts talks in these).
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
}

export interface ApiParticipant {
  user: ApiUser;
  isHost: boolean;
  micOn: boolean;
  cameraOn: boolean;
  joinedAt: string;
}

export interface ApiRoom {
  _id: string;
  title: string;
  code: string;
  host: ApiUser;
  movieName: string;
  movieSource: string;
  sourceType: "url" | "upload" | "library";
  isPrivate: boolean;
  isLocked: boolean;
  allowGuestControl: boolean;
  maxGuests: number;
  chatEnabled: boolean;
  voiceEnabled: boolean;
  participants: ApiParticipant[];
  playback: {
    isPlaying: boolean;
    progress: number;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiMessage {
  _id: string;
  room: string;
  author?: string;
  authorName: string;
  text: string;
  isSystem: boolean;
  createdAt: string;
}

// Shape of the room's realtime playback state, held in the backend's
// server memory (see backend/src/socket/socket.js) and mirrored here.
export interface PlaybackState {
  hostId: string;
  allowGuestControl: boolean;
  status: "playing" | "paused";
  position: number;
  playbackRate: number;
  /** Server clock time (ms) of the last play/pause/seek. */
  updatedAt: number;
}

// A playback state snapshot as received by this client: `serverTime` is the
// server's clock at the moment it sent this, and `receivedAt` is this
// client's own clock at the moment it was received — together they're what
// let the client keep computing "expected position" locally without
// needing the server and client clocks to agree with each other.
export interface SyncSnapshot {
  state: PlaybackState;
  serverTime: number;
  receivedAt: number;
}
