import React, { useEffect } from "react";
import { Sidebar } from "../components/sidebar";
import { Chatwindow } from "./chatwindow";
import { useChat } from "../context/Chatcontext";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const { token } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <Chatwindow />
    </div>
  );
};
