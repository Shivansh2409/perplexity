import React from "react";
import { Outlet } from "react-router";
import Sidebar from "../components/Sidebar";

const ChatLayout = () => {
  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Right Content Changes */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default ChatLayout;
