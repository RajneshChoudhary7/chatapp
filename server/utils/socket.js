let onlineUsers = {};

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join user
    socket.on("joinUser", (username) => {
      onlineUsers[socket.id] = username;

      io.emit("onlineUsers", Object.values(onlineUsers));
    });

    // Send Message
    socket.on("sendMessage", (data) => {
      io.emit("receiveMessage", data);
    });

    // Disconnect
    socket.on("disconnect", () => {
      delete onlineUsers[socket.id];

      io.emit("onlineUsers", Object.values(onlineUsers));
      console.log("User disconnected");
    });
  });
};

export default socketHandler;
