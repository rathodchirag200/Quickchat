import React, { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  increment,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useChat } from "../context/Chatcontext";

export const SendMessage = ({ onImageSelect }) => {
  const [text, setText] = useState("");
  const { currentUser, selecteduser } = useChat();

  const handleSendMessage = async () => {
    if (!text.trim()) return;
    setText("");

    const chatId = [currentUser._id, selecteduser._id].sort().join("_");

    await addDoc(collection(db, "messages"), {
      chatId,
      text,
      senderId: currentUser._id,
      receiverId: selecteduser._id,
      seen: false,
      createdAt: serverTimestamp(),
    });

    await setDoc(
      doc(db, "chats", chatId),
      {
        chatId,
        users: [currentUser._id, selecteduser._id],
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        lastSenderId: currentUser._id,
        unreadFor: selecteduser._id,
        unreadCount: increment(1),
      },
      { merge: true }
    );
  };

  return (
    <div className="sticky bottom-0 bg-white px-3 md:px-6 py-3 md:py-4 border-t border-gray-200">
      <div className="h-12 md:h-14 rounded-full flex items-center gap-3 md:gap-4 px-3 border border-gray-300">

        <label className="cursor-pointer shrink-0">
          <input
            type="file"
            accept="image/*,video/*,.pdf"
            multiple
            hidden
            onChange={onImageSelect}
          />
          <img
            src="/img.png"
            className="w-7 md:w-8"
            alt="attach"
          />
        </label>

        <input
          type="text"
          placeholder="Type a message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 outline-none text-sm md:text-base"
        />

        <img
          src="/send.webp"
          className="w-9 md:w-11 cursor-pointer shrink-0"
          onClick={handleSendMessage}
          alt="send"
        />
      </div>
    </div>
  );
};
