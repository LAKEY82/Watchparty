import { io, Socket } from "socket.io-client";

// The realtime server lives at the same host as the REST API, just without
// the "/api" prefix — Socket.IO attaches to the same HTTP server as
// Express (see backend/src/server.js), it doesn't need its own address.
// Override with NEXT_PUBLIC_SOCKET_URL directly if the two ever diverge.
export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

let socket: Socket | null = null;
let socketToken: string | null = null;

// One shared socket per tab, reused across components. Reconnects only if
// the token actually changed (e.g. a fresh login).
export function getSocket(token: string): Socket {
  if (socket && socketToken === token) return socket;

  socket?.disconnect();
  socketToken = token;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
  });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
  socketToken = null;
}
