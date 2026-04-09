import React from "react";
import { Outlet } from "react-router";
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";

const ChatLayout = () => {
  const theme = useSelector((state) => state.theme.mode);

  return (
    <div
      className={`flex h-screen overflow-hidden ${
        theme === "dark" ? "bg-gray-950 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Right Content Changes */}
      <main
        className={`flex-1 overflow-auto ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default ChatLayout;
