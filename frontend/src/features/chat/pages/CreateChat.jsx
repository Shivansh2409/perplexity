import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Plus } from "lucide-react";
import { createChat, setCurrentChat } from "../chat.slice";

const CreateChat = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    chats = [],
    loading,
    currentChat,
  } = useSelector((state) => state.chat);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    // Mock persisted chats
    const saved = JSON.parse(localStorage.getItem("mockChats") || "[]");
    if (saved.length) {
      dispatch({ type: "chat/setChats", payload: saved });
    }
  }, [dispatch]);

  const handleSend = async () => {
    if (inputValue.trim()) {
      try {
        const result = await dispatch(createChat(inputValue.trim())).unwrap();
        dispatch(setCurrentChat(result));
        const updatedChats = [result, ...chats];
        localStorage.setItem("mockChats", JSON.stringify(updatedChats));
        dispatch({ type: "chat/setChats", payload: updatedChats });
        navigate(`/chat/${result.chatId}`);
        setInputValue("");
      } catch (err) {
        console.error("Create chat error:", err);
      }
    }
  };

  const handleChatClick = (chat) => {
    dispatch(setCurrentChat(chat));
    navigate(`/chat/${chat.id}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-900 flex flex-col">
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

        <div className="flex-1 overflow-y-auto py-2">
          {chats.length ? (
            chats.map((chat) => (
              <div
                key={chat.id}
                className="p-4 hover:bg-gray-900/50 cursor-pointer mx-2 rounded-xl transition-all group border-l-4 border-transparent hover:border-cyan-400 hover:shadow-sm"
                onClick={() => handleChatClick(chat)}
              >
                <div className="font-medium text-sm truncate text-gray-200 group-hover:text-white">
                  {chat.title}
                </div>
                <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-400">
                  {chat.updated || "Just now"}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No chats yet. Create your first one!</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-900">
          <button
            className="w-full flex items-center gap-3 p-3 bg-gray-900 hover:bg-gray-800 rounded-xl border border-gray-800 transition-all font-medium text-sm group disabled:opacity-50"
            disabled={loading}
          >
            <div className="w-6 h-6 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-colors">
              <Plus size={16} />
            </div>
            {loading ? "Creating..." : "New Chat"}
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col bg-[#0a0a0a]">
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-cyan-400/30">
              <span className="text-xl font-bold text-black">AI</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 text-white leading-tight">
              The world's most powerful AI.
            </h2>
            <p className="text-gray-400 mb-12 max-w-lg mx-auto text-lg">
              Ask anything. Get answers instantly.
              <span className="text-cyan-400 font-medium"> Free forever.</span>
            </p>
          </div>
        </div>

        <div className="px-12 pb-12">
          <div className="max-w-3xl mx-auto relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What would you like to learn about?"
              className="w-full p-6 pr-20 pt-10 text-lg bg-gray-950/50 border border-gray-800/50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 placeholder-gray-500 backdrop-blur-sm shadow-inner min-h-[100px] transition-all duration-200 hover:shadow-lg disabled:opacity-50"
              rows="3"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || loading}
              className="absolute bottom-6 right-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all w-12 h-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-6 h-6 rotate-[-20deg]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M2 21l21-9-21 9zM20 5l-2 4-3-2-3 3-3-4-2 5h16z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChat;
