import { Server } from "socket.io";

let io = null;

export const initSocket = (server, clientUrl) => {
  io = new Server(server, { cors: { origin: clientUrl, credentials: true } });

  io.on("connection", (socket) => {
    socket.on("join_order_room", (orderId) => {
      socket.join(`order_${orderId}`);
    });
    socket.on("disconnect", () => {});
  });

  return io;
};

export const getIO = () => io;
