import React from "react";
import { Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createChat } from "../chat.slice";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { fetchChats } from "../hooks/useChat";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chats } = useSelector((state) => state.chat);
  const loading = useSelector((state) => state.chat.loading);

  const handleNewChat = async () => {
    try {
      const result = await dispatch(createChat("New chat")).unwrap();
      navigate(`/chat/${result.chatId}`);
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
    <div className="w-80 border-r border-gray-900 flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="p-6 border-b border-gray-900">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xs font-bold text-black">P</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Perplexity</h1>
            <div className="h-1 w-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-1 shadow-sm"></div>
          </div>
        </div>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto py-2">
        {chats.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg mb-4">No conversations yet</p>
            <p className="text-sm">Start one using the button below</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className="p-4 hover:bg-gray-900/50 cursor-pointer mx-2 rounded-xl transition-all group border-l-4 border-transparent hover:border-cyan-400 hover:shadow-sm"
              onClick={() => handleChatSelect(chat.id)}
            >
              <div className="font-medium text-sm truncate text-gray-200 group-hover:text-white">
                {chat.title}
              </div>
              <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-400">
                {chat.updated || "Just now"}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-t border-gray-900">
        <button
          onClick={handleNewChat}
          disabled={loading}
          className="w-full flex items-center gap-3 p-3 bg-gray-900 hover:bg-gray-800 rounded-xl border border-gray-800 transition-all font-medium text-sm group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-6 h-6 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-colors">
            <Plus size={16} />
          </div>
          {loading ? "Creating..." : "New Chat"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
