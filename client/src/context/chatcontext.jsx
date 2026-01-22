import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { doc, updateDoc } from "firebase/firestore";
import { db , app } from "../config/firebase";
import {
  getDatabase,
  ref,
  set,
  onDisconnect,
  serverTimestamp,
} from "firebase/database";

export const Chatcontext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [selecteduser, setselecteduser] = useState(null);
      const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();     

  const realtimeDB = getDatabase(app);

  useEffect(() => {
    const getMe = async () => {
      try {
        const res = await axios.get(`${API_URL}api/getme`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCurrentUser(res.data.data);
      } catch {
        console.log("something went wrong");
      }
    };

    getMe();
  }, [token, navigate]);

  useEffect(() => {
    if (!currentUser) return;

    const statusRef = ref(realtimeDB, `status/${currentUser._id}`);

    set(statusRef, {
      state: "online",
      lastSeen: serverTimestamp(),
    });

    onDisconnect(statusRef).set({
      state: "offline",
      lastSeen: serverTimestamp(),
    });
  }, [currentUser, realtimeDB]);

  const handleLogout = async () => {
    if (currentUser) {
      const statusRef = ref(realtimeDB, `status/${currentUser._id}`);
      await set(statusRef, {
        state: "offline",
        lastSeen: serverTimestamp(),
      });
    }

    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
    toast.success("You are logged out successfully");
  };

  const openChat = async (user) => {
    setselecteduser(user);

    if (!currentUser) return;

    const chatId = [currentUser._id, user._id].sort().join("_");

    try {
      await updateDoc(doc(db, "chats", chatId), {
        unreadFor: null,
        unreadCount: 0,
      });
    } catch (error) {
      console.error("Failed to reset your unread count", error);
    }
  };

  const closeChat = () => setselecteduser(null);

  return (
    <Chatcontext.Provider
      value={{
        currentUser,
        setToken,
        handleLogout,
        openChat,
        selecteduser,
        setCurrentUser,
        closeChat,
        token
      }}
    >
      {children}
    </Chatcontext.Provider>
  );
};

export const useChat = () => useContext(Chatcontext);
