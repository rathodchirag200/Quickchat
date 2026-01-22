import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiSearch, FiLogOut, FiMoreVertical } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useChat } from "../context/ChatContext";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../config/firebase";

export const Sidebar = () => {
  const { currentUser, openChat, handleLogout, selecteduser } = useChat();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [chats, setChats] = useState({});
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  const fetchUsers = async (me) => {
    try {
      setLoadingUsers(true);
      const res = await axios.get(`${API_URL}api/users`);
      const filtered = res.data.data.filter((u) => u._id !== me._id);
      setUsers(filtered);
    } catch (err) {
      console.error("users error", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers(currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "chats"),
      where("users", "array-contains", currentUser._id)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const chatMap = {};
      snapshot.forEach((doc) => {
        chatMap[doc.data().chatId] = doc.data();
      });
      setChats(chatMap);
    });

    return () => unsub();
  }, [currentUser]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString();
  };

  const sortedUsers = [...users].sort((a, b) => {
    const chatA = chats[[currentUser._id, a._id].sort().join("_")];
    const chatB = chats[[currentUser._id, b._id].sort().join("_")];

    const timeA = chatA?.lastMessageAt?.seconds || 0;
    const timeB = chatB?.lastMessageAt?.seconds || 0;

    return timeB - timeA;
  });

  return (
    <div
      className={`
    h-screen bg-white border-r border-gray-200 flex flex-col
    w-full md:w-[24%] md:min-w-[320px] md:shrink-0
    ${selecteduser ? "hidden md:flex" : "flex"}
  `}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <img src="/logo2.png" className="w-11 h-11" />
          <h2 className="font-semibold text-[20px]">QuickChat</h2>
        </div>
        <FiMoreVertical />
      </div>

      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-xl">
          <FiSearch />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loadingUsers ? (
          <p className="text-center mt-6 text-gray-400">Loading users...</p>
        ) : sortedUsers.length === 0 ? (
          <p className="text-center mt-6 text-gray-400">No users found</p>
        ) : (
          sortedUsers
            .filter((u) =>
              u.username.toLowerCase().includes(search.toLowerCase())
            )
            .map((user) => {
              const chatId = [currentUser._id, user._id].sort().join("_");

              const chat = chats[chatId];
              const isMe = chat?.lastSenderId === currentUser._id;

              const unread =
                chat?.unreadFor === currentUser._id
                  ? chat?.unreadCount || 0
                  : 0;

              return (
                <div
                  key={user._id}
                  onClick={() => openChat(user)}
                  className={`flex items-center gap-4 px-5 py-4 cursor-pointer border-b border-gray-200
    ${selecteduser?._id === user._id ? "bg-[#d9d7d463]" : "hover:bg-gray-50"}
  `}
                >
                  <img
                    src={
                      user.image?.startsWith("http")
                        ? user.image
                        : `${API_URL}${user.image}`
                    }
                    className="w-12 h-12 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{user.username}</h4>
                      <span className="text-xs text-gray-400">
                        {formatTime(chat?.lastMessageAt)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <p
                        className={`text-sm truncate ${
                          unread ? "font-semibold text-black" : "text-gray-500"
                        }`}
                      >
                        {chat
                          ? isMe
                            ? `You: ${chat.lastMessage}`
                            : chat.lastMessage
                          : "Start a conversation"}
                      </p>

                      {unread > 0 && (
                        <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {currentUser && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200">
          <div
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img
              src={
                currentUser.image?.startsWith("http")
                  ? currentUser.image
                  : `${API_URL}${currentUser.image}`
              }
              alt="profile"
              className="w-9 h-9 rounded-full object-cover"
            />

            <div>
              <p className="text-sm font-medium">{currentUser.username}</p>
              <p className="text-xs text-gray-400">View Profile</p>
            </div>
          </div>

          <FiLogOut
            onClick={handleLogout}
            className="cursor-pointer hover:text-red-500"
          />
        </div>
      )}
    </div>
  );
};
