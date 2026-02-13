import User from "../models/user.model.js";

let onlineUsers = {};

const socketHandler = (io) => {
  io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);

    //  User joins
    socket.on("joinUser", async (userId) => {

      onlineUsers[userId] = socket.id;

      // Update DB
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
      });

      // Send online users list
      io.emit("onlineUsers", Object.keys(onlineUsers));
    });

    //  Disconnect
    socket.on("disconnect", async () => {

      const userId = onlineUsers[socket.id];

      if (userId) {

        const lastSeenTime = new Date();

        // Update DB offline + lastSeen
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: lastSeenTime,
        });

        // ❗ Emit lastSeen event
        io.emit("lastSeen", {
          userId,
          lastSeen: lastSeenTime,
        });

        if (userId) delete onlineUsers[userId];

        io.emit("onlineUsers", Object.keys(onlineUsers));

        console.log("User disconnected:", userId);
      }
    });
  });
};

export default socketHandler;
