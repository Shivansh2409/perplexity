import React from "react";
import { Plus, LogOut, Bell, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createChat } from "../chat.slice";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { fetchChats } from "../hooks/useChat";
import Markdown from "react-markdown";
import ThemeToggle from "../../theme/ThemeToggle";

const formatDate = (dateString) => {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  
  // Reset times to compare dates properly
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffInDays = Math.floor((today - itemDate) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  }
};

const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chats } = useSelector((state) => state.chat);
  const loading = useSelector((state) => state.chat.loading);
  const theme = useSelector((state) => state.theme.mode);
  const { user } = useSelector((state) => state.auth);
  const [showNotificationBell, setShowNotificationBell] = useState(false);

  const handleNewChat = async () => {
    try {
      navigate(`/`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChatSelect = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  useEffect(() => {
    fetchChats(dispatch);
  }, [dispatch]);

  return (
    <div
      className={`w-80 border-r flex flex-col fixed md:relative z-50 h-full transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } ${
        theme === "dark"
          ? "bg-gray-950 border-gray-800 text-gray-100 shadow-[2px_0_10px_rgba(0,0,0,0.5)] md:shadow-none"
          : "bg-gray-50 border-gray-200 text-gray-900 shadow-xl md:shadow-none"
      }`}
    >
      <div
        className={`p-6 border-b ${
          theme === "dark" ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg ${
              theme === "dark" 
                ? "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-500" 
                : "bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-500"
            }`}>
              <span className={`text-xs font-bold ${theme === "dark" ? "text-gray-900" : "text-black"}`}>P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Perplexity</h1>
              <div className={`h-1 w-16 rounded-full mt-1 shadow-sm ${
                theme === "dark"
                  ? "bg-gradient-to-r from-gray-400 to-gray-600"
                  : "bg-gradient-to-r from-cyan-400 to-blue-500"
              }`}></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button 
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        {user && (
          <p
            className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            Welcome, {user.username}
          </p>
        )}
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto py-2">
        {chats.length === 0 ? (
          <div
            className={`p-12 text-center ${
              theme === "dark" ? "text-gray-500" : "text-gray-400"
            }`}
          >
            <p className="text-lg mb-4">No conversations yet</p>
            <p className="text-sm">Start one using the button below</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat._id}
              className={`p-4 cursor-pointer mx-2 rounded-xl transition-all group border-l-4 border-transparent ${
                theme === "dark"
                  ? "hover:bg-gray-800/50 hover:border-gray-500"
                  : "hover:bg-gray-100 hover:border-gray-400"
              }`}
              onClick={() => {
                handleChatSelect(chat._id);
                if(onClose) onClose();
              }}
            >
              <div
                className={`font-medium text-sm truncate ${
                  theme === "dark"
                    ? "text-gray-300 group-hover:text-white"
                    : "text-gray-700 group-hover:text-gray-900"
                }`}
              >
                <Markdown>{chat.title}</Markdown>
              </div>
              <div
                className={`text-xs mt-1 ${
                  theme === "dark"
                    ? "text-gray-500 group-hover:text-gray-400"
                    : "text-gray-500 group-hover:text-gray-600"
                }`}
              >
                {formatDate(chat.updatedAt)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Chat Button & Footer */}
      <div
        className={`p-4 border-t ${
          theme === "dark" ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <button
          onClick={handleNewChat}
          disabled={loading}
          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all font-medium text-sm group disabled:opacity-50 disabled:cursor-not-allowed ${
            theme === "dark"
              ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
              : "bg-gray-100 hover:bg-gray-200 border-gray-300"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
              theme === "dark"
                ? "bg-gray-700 group-hover:bg-gray-300 group-hover:text-gray-900"
                : "bg-gray-200 group-hover:bg-gray-700 group-hover:text-white"
            }`}
          >
            <Plus size={16} />
          </div>
          {loading ? "Creating..." : "New Chat"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
