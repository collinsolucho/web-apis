import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 3001 });
const rooms = new Map();

function send(socket, message) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

wss.on("connection", (socket) => {
  socket.on("message", (raw) => {
    let message;

    try {
      message = JSON.parse(raw.toString());
    } catch {
      send(socket, { type: "error", message: "Invalid message." });
      return;
    }

    if (message.type === "join") {
      const roomId = String(message.roomId ?? "").trim();

      if (!roomId || roomId.length > 80) {
        send(socket, { type: "error", message: "Enter a valid room ID." });
        return;
      }

      let room = rooms.get(roomId);
      if (!room) {
        room = new Set();
        rooms.set(roomId, room);
      }

      if (room.size >= 2) {
        send(socket, { type: "error", message: "Room is full." });
        return;
      }

      socket.roomId = roomId;
      socket.role = room.size === 0 ? "caller" : "receiver";
      room.add(socket);

      send(socket, { type: "joined", role: socket.role });

      if (room.size === 2) {
        for (const peer of room) send(peer, { type: "peer-ready" });
      }

      return;
    }

    // Relay only WebRTC setup messages to the other person in this room.
    if (!["offer", "answer", "ice-candidate"].includes(message.type)) return;

    const room = rooms.get(socket.roomId);
    if (!room) return;

    for (const peer of room) {
      if (peer !== socket) send(peer, message);
    }
  });

  socket.on("close", () => {
    const roomId = socket.roomId;
    const room = rooms.get(roomId);

    if (!room) return;

    room.delete(socket);
    for (const peer of room) send(peer, { type: "peer-left" });

    if (room.size === 0) rooms.delete(roomId);
  });
});

console.log("Signaling server listening at ws://localhost:3001");
