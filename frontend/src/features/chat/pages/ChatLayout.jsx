import React, { useState } from "react";
import { Outlet } from "react-router";
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";

const ChatLayout = () => {
  const theme = useSelector((state) => state.theme.mode);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div
      className={`flex h-screen overflow-hidden relative ${
        theme === "dark" ? "bg-gray-950 text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile unless open */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Right Content Changes */}
      <main
        className={`flex-1 flex flex-col overflow-hidden w-full transition-all duration-300 ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <Outlet context={{ onMenuClick: () => setIsSidebarOpen(true) }} />
      </main>
    </div>
  );
};

export default ChatLayout;
