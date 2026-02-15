import React, { useEffect, useState, useRef } from "react";
import {
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
} from "lucide-react";
import axios from "axios";
import socket from "../utils/socket";

const Home = () => {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typingStatus, setTypingStatus] = useState({});
  const [userLastSeen, setUserLastSeen] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [conversations, setConversations] = useState([]);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  // Fetch all conversations with last messages
  const fetchConversations = async () => {
    if (!currentUser) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/messages/conversations/${currentUser._id}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setConversations(res.data);
    } catch (error) {
      console.log("Error fetching conversations:", error.message);
    }
  };

  // Fetch users from DB
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/users/all", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Users API Response:", res.data);
      console.log("CurrentUser:", currentUser);

      // Filter out current user
      if (!currentUser) return;
      const otherUsers = res.data.filter(
        (user) => user._id !== currentUser._id,
      );
      setUsers(otherUsers);

      // Fill lastSeen state
      const lastSeenMap = {};
      res.data.forEach((user) => {
        lastSeenMap[user._id] = user.lastSeen;
      });

      setUserLastSeen(lastSeenMap);
    } catch (error) {
      console.log("Error fetching users:", error.message);
    }
  };

  // Fetch messages for selected chat
  const fetchMessages = async (userId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/messages/${currentUser._id}/${userId}`,
        { withCredentials: true },
      );
      setAllMessages(res.data);

      // Mark messages as read
      if (res.data.length > 0) {
        socket.emit("markAsRead", {
          senderId: userId,
          receiverId: currentUser._id,
          messageIds: res.data.map((m) => m._id),
        });

        // Clear unread count for this user
        setUnreadCounts((prev) => ({
          ...prev,
          [userId]: 0,
        }));
      }
    } catch (error) {
      console.log("Error fetching messages:", error.message);
    }
  };

  // On page load
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("Current User Loaded:", user);
    if (user) {
      setCurrentUser(user);
      socket.emit("joinUser", user._id);
      socket.emit("userOnline", user._id);
    }

    return () => {
      if (currentUser) {
        socket.emit("userOffline", currentUser._id);
      }
    };
  }, []);

  // Fetch users and conversations when currentUser is set
  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchConversations();
    }
  }, [currentUser]);

  // Socket listeners
  useEffect(() => {
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("receiveMessage", (data) => {
      // Update conversations list
      setConversations((prev) => {
        const existing = prev.filter((c) => c.userId !== data.senderId);
        return [
          {
            userId: data.senderId,
            lastMessage: data,
            unreadCount: selectedUser?._id === data.senderId ? 0 : 1,
          },
          ...existing,
        ];
      });

      if (selectedUser && data.senderId === selectedUser._id) {
        setAllMessages((prev) => [...prev, data]);
        socket.emit("markAsRead", {
          senderId: data.senderId,
          receiverId: currentUser._id,
          messageIds: [data._id],
        });
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [data.senderId]: (prev[data.senderId] || 0) + 1,
        }));
      }
    });

    socket.on("typing", ({ userId, isTyping }) => {
      setTypingStatus((prev) => ({
        ...prev,
        [userId]: isTyping,
      }));
    });

    socket.on("messagesRead", ({ readerId, messageIds }) => {
      setAllMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg._id) ? { ...msg, read: true } : msg,
        ),
      );
    });

    socket.on("lastSeen", ({ userId, lastSeen }) => {
      setUserLastSeen((prev) => ({
        ...prev,
        [userId]: lastSeen,
      }));
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("messagesRead");
      socket.off("lastSeen");
    };
  }, [selectedUser, currentUser]);

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchMessages(user._id);

    // Clear unread count
    setUnreadCounts((prev) => ({
      ...prev,
      [user._id]: 0,
    }));
  };

  // Send message
  const sendMessage = async () => {
    if (message.trim() === "" || !selectedUser) return;

    const msgData = {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      text: message,
      time: new Date().toISOString(),
      read: false,
      status: "sent",
    };

    console.log("currentUser:", currentUser);
    console.log("selectedUser:", selectedUser);
    console.log("message:", message);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/messages/send",
        msgData,
        { withCredentials: true },
      );

      socket.emit("sendMessage", res.data);

      setAllMessages((prev) => [...prev, res.data]);
      setMessage("");

      socket.emit("typing", {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        isTyping: false,
      });
    } catch (error) {
      console.log("Error sending message:", error.message);
    }
  };

  // Handle typing
  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (selectedUser) {
      socket.emit("typing", {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        isTyping: e.target.value.length > 0,
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", {
          senderId: currentUser._id,
          receiverId: selectedUser._id,
          isTyping: false,
        });
      }, 1000);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Format last seen
  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "last seen recently";

    const lastSeenDate = new Date(lastSeen);

    // ✅ Invalid Date check
    if (isNaN(lastSeenDate.getTime())) {
      return "last seen recently";
    }

    const now = new Date();
    const diffMinutes = Math.floor((now - lastSeenDate) / 60000);

    if (diffMinutes < 1) return "last seen just now";
    if (diffMinutes < 60) return `last seen ${diffMinutes} min ago`;
    if (diffMinutes < 120) return "last seen 1 hour ago";
    if (diffMinutes < 1440)
      return `last seen ${Math.floor(diffMinutes / 60)} hours ago`;

    return lastSeenDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Get last message from conversation
  const getLastMessage = (userId) => {
    const conv = conversations.find((c) => c.userId === userId);

    if (!conv?.lastMessage?.text) return "No messages yet";

    const text = conv.lastMessage.text;

    return text.length > 30 ? text.substring(0, 30) + "..." : text;
  };

  // Get unread count
  const getUnreadCount = (userId) => {
    return unreadCounts[userId] || 0;
  };

  const handleFileSend = async(e)=>{
    const file  = e.target.files[0];
    if(!file) return

    const formData = new FormData();
    formData.append("file", file)

    try {
      
      //upload file to backed
      const uploadRes = await axios.post(
        "http://localhost:5000/api/upload/file",
        formData,
        {withCredentials:true}
      )

      const fileMessage = {
        senderId : currentUser._id,
        receiverId:selectedUser._id,

        fileUrl:uploadRes.data.fileUrl,
        fileType:uploadRes.data.fileType,
        fileName:uploadRes.data.fileName,

        messageType : uploadRes.data.fileType.startsWith("image")
        ? "image"
        : uploadRes.data.fileType.startsWith("video")
        ? "video"
        : "pdf",

        time:new Date()
      }
    } catch (error) {
      
    }
  }

















  return (
    <div className="h-screen w-screen flex bg-[#f0f2f5] font-sans overflow-hidden m-0 p-0">
      {/* Left Sidebar - 30% */}
      <div className="w-[30%] flex flex-col bg-white border-r border-gray-200">
        {/* Sidebar Header */}
        <div className="h-16 bg-[#f0f2f5] flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
              {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <span className="font-semibold text-gray-700">
              {currentUser?.name || "Loading..."}
            </span>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-200 rounded-full transition-all">
              <MoreVertical size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-white">
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#f0f2f5] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500/20"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserSelect(user)}
                className={`flex items-center gap-3 p-3 cursor-pointer transition-all duration-200 
                  ${
                    selectedUser?._id === user._id
                      ? "bg-[#f0f9f0]"
                      : "hover:bg-gray-50"
                  }`}
              >
                {/* Avatar with online indicator */}
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {onlineUsers.includes(user._id) ? (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                  ) : (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-gray-400 rounded-full border-2 border-white"></div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h2 className="font-medium text-gray-800 truncate">
                      {user.name}
                    </h2>
                    <span className="text-xs text-gray-500">
                      {onlineUsers.includes(user._id)
                        ? "Online"
                        : userLastSeen[user._id]
                          ? formatLastSeen(userLastSeen[user._id])
                          : "last seen recently"}
                    </span>
                  </div>

                  {/* Last message preview with typing indicator */}
                  <div className="flex justify-between items-center">
                    {typingStatus[user._id] ? (
                      <p className="text-xs text-green-600 animate-pulse">
                        typing<span className="animate-pulse">...</span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 truncate max-w-[150px]">
                        {getLastMessage(user._id)}
                      </p>
                    )}

                    {/* Unread badge */}
                    {getUnreadCount(user._id) > 0 && (
                      <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {getUnreadCount(user._id)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Chat Window - 70% */}
      <div className="w-[70%] flex flex-col bg-[#efeae2]">
        {!selectedUser ? (
          /* Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5]">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg mb-4">
              <span className="text-4xl text-white">💬</span>
            </div>
            <h2 className="text-2xl font-light text-gray-700 mb-2">
              WhatsApp Web
            </h2>
            <p className="text-sm text-gray-500">
              Select a chat to start messaging
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-[#f0f2f5] flex items-center justify-between px-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  {onlineUsers.includes(selectedUser._id) && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-medium text-gray-800">
                    {selectedUser.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {typingStatus[selectedUser._id] ? (
                      <span className="text-green-600 animate-pulse">
                        typing...
                      </span>
                    ) : onlineUsers.includes(selectedUser._id) ? (
                      "Online"
                    ) : userLastSeen[selectedUser._id] ? (
                      formatLastSeen(userLastSeen[selectedUser._id])
                    ) : (
                      "last seen recently"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="p-2 hover:bg-gray-200 rounded-full transition-all">
                  <Phone size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-full transition-all">
                  <Video size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-full transition-all">
                  <MoreVertical size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages Area - WhatsApp Wallpaper */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 bg-[#efeae2]"
              style={{
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="%23efeae2"/><circle cx="10" cy="10" r="1.5" fill="%23ddd8d0"/><circle cx="30" cy="20" r="1.2" fill="%23ddd8d0"/><circle cx="50" cy="40" r="1.8" fill="%23ddd8d0"/><circle cx="20" cy="50" r="1.3" fill="%23ddd8d0"/><circle cx="45" cy="15" r="1.1" fill="%23ddd8d0"/><circle cx="5" cy="35" r="1.4" fill="%23ddd8d0"/></svg>')`,
                backgroundRepeat: "repeat",
                backgroundSize: "60px 60px",
              }}
            >
              <div className="max-w-4xl mx-auto space-y-1">
                {allMessages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-gray-500 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                      No messages yet. Say hello! 👋
                    </p>
                  </div>
                ) : (
                  allMessages.map((msg, index) => (
                    <div
                      key={msg._id || index}
                      className={`flex mb-2 ${
                        msg.senderId === currentUser._id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`relative max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 shadow-sm ${
                          msg.senderId === currentUser._id
                            ? "bg-[#d9fdd3] rounded-lg rounded-tr-none"
                            : "bg-white rounded-lg rounded-tl-none"
                        }`}
                      >
                        <p className="text-sm break-words text-gray-800">
                          {msg.text}
                        </p>

                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[11px] text-gray-500">
                            {new Date(msg.time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          {msg.senderId === currentUser._id && (
                            <span className="text-gray-500">
                              {msg.read ? (
                                <CheckCheck
                                  size={14}
                                  className="text-blue-500"
                                />
                              ) : (
                                <Check size={14} />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="bg-[#f0f2f5] px-4 py-3 flex items-center gap-2">
              <button className="p-2 hover:bg-gray-200 rounded-full transition-all">
                <Smile size={22} className="text-gray-600" />
              </button>
              <button onClick={() => document.getElementById("fileUpload").click()}
               className="p-2 hover:bg-gray-200 rounded-full transition-all">
                <Paperclip size={22} className="text-gray-600 rotate-45" />
                <input
                  type="file"
                  id="fileUpload"
                  hidden
                  onChange={handleFileSend}
                />
              </button>

              <div className="flex-1 bg-white rounded-lg px-4 py-2">
                <input
                  type="text"
                  placeholder="Type a message"
                  value={message}
                  onChange={handleTyping}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="w-full outline-none text-sm bg-transparent"
                />
              </div>

              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className={`p-2.5 rounded-full transition-all ${
                  message.trim()
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Send size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
