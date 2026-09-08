import { ChatMessage, Participant, Room } from "@/types";

export const avatarColors = [
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-indigo-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-purple-500",
];

export const mockParticipants: Participant[] = [
  { id: "1", name: "You", avatarColor: avatarColors[0], isHost: true, micOn: true, cameraOn: false, status: "watching" },
  { id: "2", name: "Maya Chen", avatarColor: avatarColors[1], micOn: true, cameraOn: true, status: "watching" },
  { id: "3", name: "Diego Ruiz", avatarColor: avatarColors[2], micOn: false, cameraOn: false, status: "watching" },
  { id: "4", name: "Amara Okoye", avatarColor: avatarColors[3], micOn: true, cameraOn: false, status: "away" },
  { id: "5", name: "Noah Kim", avatarColor: avatarColors[4], micOn: false, cameraOn: true, status: "watching" },
];

export const mockRooms: Room[] = [
  {
    id: "r1",
    code: "NEON-482",
    title: "Friday Movie Night",
    movieTitle: "Nocturne Drive",
    poster:
      "linear-gradient(135deg, rgba(139,92,246,0.55), rgba(236,72,153,0.35)), radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15), transparent 60%)",
    participants: mockParticipants.slice(0, 4),
    participantCount: 4,
    duration: 7320,
    progress: 0.42,
    isLive: true,
    lastActive: "Live now",
  },
  {
    id: "r2",
    code: "ECHO-119",
    title: "Weekend Binge",
    movieTitle: "Glass Horizon",
    poster:
      "linear-gradient(135deg, rgba(99,102,241,0.55), rgba(16,185,129,0.3)), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.12), transparent 60%)",
    participants: mockParticipants.slice(1, 3),
    participantCount: 2,
    duration: 6100,
    progress: 1,
    isLive: false,
    lastActive: "2 hours ago",
  },
  {
    id: "r3",
    code: "VOLT-773",
    title: "Late Night Thriller",
    movieTitle: "Cipher Room",
    poster:
      "linear-gradient(135deg, rgba(244,63,94,0.5), rgba(217,70,239,0.35)), radial-gradient(circle at 20% 70%, rgba(255,255,255,0.12), transparent 60%)",
    participants: mockParticipants.slice(2, 5),
    participantCount: 3,
    duration: 5400,
    progress: 0.15,
    isLive: false,
    lastActive: "Yesterday",
  },
  {
    id: "r4",
    code: "AMBR-355",
    title: "Sunday Classics",
    movieTitle: "The Long Reel",
    poster:
      "linear-gradient(135deg, rgba(245,158,11,0.5), rgba(239,68,68,0.3)), radial-gradient(circle at 60% 80%, rgba(255,255,255,0.12), transparent 60%)",
    participants: mockParticipants.slice(0, 2),
    participantCount: 2,
    duration: 8100,
    progress: 0.7,
    isLive: false,
    lastActive: "3 days ago",
  },
];

export const mockMessages: ChatMessage[] = [
  {
    id: "m0",
    authorId: "system",
    authorName: "System",
    avatarColor: "",
    message: "Maya Chen joined the room",
    timestamp: "8:01 PM",
    isSystem: true,
  },
  {
    id: "m1",
    authorId: "2",
    authorName: "Maya Chen",
    avatarColor: avatarColors[1],
    message: "okay I'm so ready for this 🍿",
    timestamp: "8:02 PM",
  },
  {
    id: "m2",
    authorId: "3",
    authorName: "Diego Ruiz",
    avatarColor: avatarColors[2],
    message: "wait pause, did the sync just lag for anyone else?",
    timestamp: "8:04 PM",
  },
  {
    id: "m3",
    authorId: "1",
    authorName: "You",
    avatarColor: avatarColors[0],
    message: "nope smooth on my end, might just be your connection",
    timestamp: "8:04 PM",
  },
  {
    id: "m4",
    authorId: "5",
    authorName: "Noah Kim",
    avatarColor: avatarColors[4],
    message: "that plot twist though...",
    timestamp: "8:21 PM",
  },
  {
    id: "m5",
    authorId: "4",
    authorName: "Amara Okoye",
    avatarColor: avatarColors[3],
    message: "NO WAY 😭 I did not see that coming",
    timestamp: "8:21 PM",
  },
];
