import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import {
  collection,
  addDoc,
  serverTimestamp,
  setDoc,
  doc,
  increment,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useChat } from "../context/ChatContext";
import { uploadToCloudinary } from "../config/upload";

export const ImagePreview = ({ file, previewUrl, onClose }) => {
  if (!file) return null;

  const { currentUser, selecteduser } = useChat();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const chatId = [currentUser._id, selecteduser._id].sort().join("_");

  const send = async () => {
    if (sending) return;
    setSending(true);

    try {
      const uploaded = await uploadToCloudinary(file);

      await addDoc(collection(db, "messages"), {
        chatId,
        senderId: currentUser._id,
        receiverId: selecteduser._id,
        messageType: uploaded.type,
        text,
        fileUrl: uploaded.url,
        fileName: file.name,
        seen: false,
        createdAt: serverTimestamp(),
      });

      await setDoc(
        doc(db, "chats", chatId),
        {
          chatId,
          users: [currentUser._id, selecteduser._id],
          lastMessage:
            uploaded.type === "image"
              ? "Photo"
              : uploaded.type === "video"
              ? "Video"
              : "Document",
          lastMessageAt: serverTimestamp(),
          lastSenderId: currentUser._id,
          unreadFor: selecteduser._id,
          unreadCount: increment(1),
        },
        { merge: true }
      );

      setText("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-white flex flex-col z-10">

      <div className="flex items-center gap-4 px-6 py-4 border-b">
        <FiX onClick={onClose} className="cursor-pointer text-xl" />
        <span className="font-medium">Preview</span>
      </div>

      <div className="flex-1 flex justify-center items-center bg-gray-100 overflow-hidden">
        {file.type.startsWith("image/") && (
          <img
            src={previewUrl}
            className="max-h-[70vh] w-auto rounded"
            alt="preview"
          />
        )}

        {file.type.startsWith("video/") && (
          <video
            src={previewUrl}
            controls
            muted
            className="max-h-[40vh] w-auto rounded"
          />
        )}

        {!file.type.startsWith("image/") && !file.type.startsWith("video/") && (
          <div className="text-center">
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-gray-500">Document</p>
          </div>
        )}
      </div>


      <div className="px-6 py-4 border-t sticky bottom-0 bg-white">
        <div className="bg-white rounded-full h-14 flex items-center gap-4 px-3 shadow">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type message"
            className="flex-1 outline-none"
            disabled={sending}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
          />

          <img
            src="/send.webp"
            alt="send"
            className={`w-11 cursor-pointer ${
              sending ? "opacity-50 pointer-events-none" : ""
            }`}
            onClick={send}
          />
        </div>

        {sending && (
          <p className="text-xs text-gray-400 text-center mt-2">Uploading…</p>
        )}
      </div>
    </div>
  );
};
