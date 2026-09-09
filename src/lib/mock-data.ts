import { ChatMessage, Participant } from "@/types";

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
