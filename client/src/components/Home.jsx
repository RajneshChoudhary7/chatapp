import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";
import socket from "../utils/socket"; // ✅ socket.js import

const Home = () => {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState("");

  // ✅ On Page Load: Join User + Listen Events
  useEffect(() => {
    // Get logged-in user from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      setCurrentUser(user.name);

      // Tell server user is online
      socket.emit("joinUser", user.name);
    }

    // Receive Online Users List
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    // Receive Messages
    socket.on("receiveMessage", (data) => {
      setAllMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("receiveMessage");
    };
  }, []);

  // ✅ Send Message Function
  const sendMessage = () => {
    if (message.trim() === "") return;

    const msgData = {
      text: message,
      sender: currentUser,
      time: new Date().toLocaleTimeString(),
    };

    socket.emit("sendMessage", msgData);

    setMessage("");
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* ✅ Sidebar */}
      <div className="w-1/3 bg-white border-r">
        {/* Sidebar Header */}
        <div className="p-4 font-bold text-lg border-b">
          Online Users 🟢
        </div>

        {/* Online Users List */}
        <div className="overflow-y-auto h-full">
          {onlineUsers.length === 0 ? (
            <p className="p-4 text-gray-500">No users online</p>
          ) : (
            onlineUsers.map((user, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-200"
              >
                {/* Avatar */}
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user[0]}
                </div>

                {/* User Info */}
                <div>
                  <h2 className="font-semibold">{user}</h2>
                  <p className="text-sm text-green-600">● Online</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ✅ Chat Section */}
      <div className="w-2/3 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 bg-green-600 text-white font-semibold flex justify-between">
          <span>Welcome, {currentUser}</span>
          <span className="text-sm">🟢 Online</span>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {allMessages.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">
              No messages yet...
            </p>
          ) : (
            allMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex mb-3 ${
                  msg.sender === currentUser
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-xl max-w-xs ${
                    msg.sender === currentUser
                      ? "bg-green-500 text-white"
                      : "bg-white border"
                  }`}
                >
                  <p className="text-sm font-semibold">{msg.sender}</p>
                  <p>{msg.text}</p>
                  <p className="text-xs text-gray-200 mt-1">{msg.time}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 flex items-center gap-3 border-t bg-white">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 border rounded-full px-4 py-2 outline-none"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={sendMessage}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
