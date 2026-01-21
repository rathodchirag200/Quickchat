import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/sidebar";

export const SidebarLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};
