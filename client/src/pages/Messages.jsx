import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useChat } from "../context/chatcontext";

const formatTime = (timestamp) =>
  timestamp
    ? timestamp.toDate().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const formatDay = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const Messages = () => {
  const { currentUser, selecteduser } = useChat();
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);
  const [loading, setloading] = useState(false);

  useEffect(() => {
    if (!currentUser || !selecteduser) return;

    const chatId = [currentUser._id, selecteduser._id].sort().join("_");

    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const msgs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setMessages(msgs);
      setloading(false);

      for (const d of snapshot.docs) {
        const data = d.data();
        if (data.receiverId === currentUser._id && !data.seen) {
          await updateDoc(doc(db, "messages", d.id), { seen: true });
        }
      }
    });

    return () => unsub();
  }, [currentUser, selecteduser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  var lastDay = null;

  return (
    <div>
      {loading && (
        <div className="h-full flex items-center justify-center">
          <div className="loader"></div>
        </div>
      )}

      <div className="h-full overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 space-y-2">
        {messages.length === 0 && (
          <div className="h-full flex items-end justify-center px-3">
            <div className="flex items-center gap-2 bg-[#fff0d4] text-black text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg max-w-[95%] sm:max-w-[640px] text-center">
              <p className="leading-snug">
                Messages and calls are end-to-end encrypted. Only people in this
                chat can read, listen to, or share them.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser._id;
          const day = formatDay(msg.createdAt);
          const showDay = day !== lastDay;
          lastDay = day;

          return (
            <div key={msg.id}>
              {showDay && (
                <div className="flex justify-center my-3">
                  <span className="bg-white text-gray-600 text-xs px-3 py-1 rounded-full shadow">
                    {day}
                  </span>
                </div>
              )}

              <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                {msg.messageType === "image" && (
                  <div
                    className={`relative rounded-xl overflow-hidden
                     max-w-[85%] sm:max-w-[70%] lg:max-w-[60%]
                     ${isMe ? "bg-[#d6f3cf]" : "bg-white"}`}
                  >
                    <img
                      src={msg.fileUrl}
                      alt="chat-img"
                      className="w-full max-h-80 object-cover"
                    />

                    {msg.text && (
                      <div className="px-2 pt-1 pb-5 text-sm text-black wrap-break-words">
                        {msg.text}
                      </div>
                    )}

                    <div
                      className="absolute bottom-1 right-2 flex items-center gap-1 
      text-[10px] text-gray-600"
                    >
                      {formatTime(msg.createdAt)}
                      {isMe && (
                        <img
                          src={
                            msg.seen
                              ? "/seen-removebg-preview(1).png"
                              : "/delivered-removebg-preview.png"
                          }
                          className="w-4"
                        />
                      )}
                    </div>
                  </div>
                )}

                {msg.messageType === "video" && (
                  <div
                    className={`relative rounded-lg overflow-hidden 
                max-w-[85%] sm:max-w-[60%] lg:max-w-[35%]
                ${isMe ? "bg-[#d6f3cf]" : "bg-white"}`}
                  >
                    <video
                      src={msg.fileUrl}
                      controls
                      muted
                      className="w-full max-h-45 sm:max-h-100"
                    />

                    <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[10px] text-white bg-black/40 px-1.5 rounded">
                      {formatTime(msg.createdAt)}
                      {isMe && (
                        <img
                          src={
                            msg.seen
                              ? "/seen-removebg-preview(1).png"
                              : "/delivered-removebg-preview.png"
                          }
                          className="w-4 sm:w-5"
                        />
                      )}
                    </div>
                  </div>
                )}

                {msg.messageType === "file" && (
                  <div
                    className={`rounded-xl p-3 shadow-sm 
                max-w-[90%] sm:max-w-90
                ${isMe ? "bg-[#d6f3cf]" : "bg-white"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 flex items-center justify-center bg-red-100 text-red-600 rounded-lg">
                        📄
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {msg.fileName}
                        </p>
                        <a
                          href={msg.fileUrl.replace(
                            "/upload/",
                            "/upload/fl_attachment/"
                          )}
                          download
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Download
                        </a>
                      </div>
                    </div>

                    <div className="flex justify-end mt-2 text-[10px] text-gray-500 gap-1">
                      {formatTime(msg.createdAt)}
                      {isMe && (
                        <img
                          src={
                            msg.seen
                              ? "/seen-removebg-preview(1).png"
                              : "/delivered-removebg-preview.png"
                          }
                          className="w-4"
                        />
                      )}
                    </div>
                  </div>
                )}

                {!msg.messageType && (
                  <div
                    className={`px-3 py-2 rounded-lg text-sm 
                max-w-[85%] sm:max-w-[70%] lg:max-w-[65%]
                ${isMe ? "bg-[#d6f3cf]" : "bg-white"}`}
                  >
                    <div className="flex items-end gap-2">
                      <span className="wrap-break-word">{msg.text}</span>
                      <span className="text-[10px] text-gray-500 flex gap-1">
                        {formatTime(msg.createdAt)}
                        {isMe && (
                          <img
                            src={
                              msg.seen
                                ? "/seen-removebg-preview(1).png"
                                : "/delivered-removebg-preview.png"
                            }
                            className="w-4 sm:w-5"
                          />
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
