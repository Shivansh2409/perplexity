import React from "react";
import { Outlet } from "react-router";
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";

const ChatLayout = () => {
  const { chats } = useSelector((state) => state.chat);

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Persistent Left Sidebar */}
      <Sidebar chats={chats} />

      {/* Right Content Changes */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default ChatLayout;
