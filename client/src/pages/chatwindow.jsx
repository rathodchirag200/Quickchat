import React, { useState, useEffect } from "react";
import { FiPhone, FiVideo, FiMoreVertical, FiArrowLeft } from "react-icons/fi";
import { ImagePreview } from "./ImagePreview";
import { useChat } from "../context/Chatcontext";
import { Index } from ".";
import { SendMessage } from "./SendMessage";
import { Messages } from "./Messages";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../config/firebase";
import { toast } from "react-toastify";

export const Chatwindow = () => {
  const { selecteduser, closeChat } = useChat();
      const API_URL = import.meta.env.VITE_API_URL;

  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [status, setStatus] = useState(null);
  const realtimeDB = getDatabase(app);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);
    const fileName = file.name.toLowerCase();

    const isVideo = file.type.startsWith("video/");
    const isPDF = file.type === "application/pdf" || fileName.endsWith(".pdf");

    if (isVideo && fileSizeMB > 50) {
      toast.error("Video size must be 50 MB or less");
      e.target.value = null;
      return;
    }

    console.log(isPDF);

    if (!isVideo && fileSizeMB > 10) {
      toast.error("File size must be 10 MB or less");
      e.target.value = null;
      return;
    }

    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const formattime = (timestamp) => {
    if (!timestamp) return "Offline";

    const last = new Date(timestamp);
    const now = new Date();

    const time = last.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const isToday =
      last.getDate() === now.getDate() &&
      last.getMonth() === now.getMonth() &&
      last.getFullYear() === now.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
      last.getDate() === yesterday.getDate() &&
      last.getMonth() === yesterday.getMonth() &&
      last.getFullYear() === yesterday.getFullYear();

    if (isToday) return `last today at ${time}`;
    if (isYesterday) return `last yesterday at ${time}`;

    return `Last seen ${last.toLocaleDateString()} at ${time}`;
  };

  useEffect(() => {
    if (!selecteduser) return;

    const statusRef = ref(realtimeDB, `status/${selecteduser._id}`);

    const unsub = onValue(statusRef, (snapshot) => {
      setStatus(snapshot.val());
    });

    return () => unsub();
  }, [selecteduser, realtimeDB]);

  if (!selecteduser) return <Index />;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-center gap-2">
          <div className="md:hidden">
            <FiArrowLeft
              onClick={closeChat}
              className="text-[18px] cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-3">
            <img
              src={
                selecteduser.image?.startsWith("http")
                  ? selecteduser.image
                  : `${API_URL}${selecteduser.image}`
              }
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="text-[14px]">{selecteduser.username}</h3>
              <p className="text-xs text-gray-500">
                <p className="text-xs text-gray-500">
                  {status?.state === "online"
                    ? "online"
                    : formattime(status?.lastSeen)}
                </p>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 text-gray-500 text-lg">
          <FiVideo />
          <FiPhone />
          <FiMoreVertical className="hidden md:block" />
        </div>
      </div>

      <div
        className="flex-1 relative flex flex-col overflow-hidden bg-repeat bg-center"
        style={{ backgroundImage: "url('/background.webp')" }}
      >
        <div className="flex-1 overflow-y-auto">
          <Messages />
        </div>

        {!previewFile && <SendMessage onImageSelect={handleFileChange} />}

        {previewFile && (
          <ImagePreview
            file={previewFile}
            previewUrl={previewUrl}
            onClose={() => {
              setPreviewFile(null);
              setPreviewUrl(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
