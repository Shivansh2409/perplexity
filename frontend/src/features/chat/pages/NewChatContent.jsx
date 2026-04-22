import React, { useState } from "react";
import { useChatAPI } from "../service/chat.api";
import { useDispatch, useSelector } from "react-redux";
import { setChats } from "../chat.slice";
import { useNavigate, useOutletContext } from "react-router";
import { setFirstMessageContent, setFirstMessageSent } from "../chat.slice";
import { Menu } from "lucide-react";

const NewChatContent = () => {
  const api = useChatAPI();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { onMenuClick } = useOutletContext() || {};
  const theme = useSelector((state) => state.theme.mode);
  const { chats } = useSelector((state) => state.chat);
  const [inputValue, setInputValue] = useState("");

  const handleSend = async () => {
    if (inputValue.trim()) {
      try {
        const result = await api.createChat(inputValue.trim());
        const newChat = {
          _id: result.chatId,
          title: result.title,
          updated: "Just now",
        };
        dispatch(setChats([newChat, ...chats]));
        dispatch(setFirstMessageContent(inputValue.trim()));
        dispatch(setFirstMessageSent(true));
        navigate(`/chat/${result.chatId}`);
        setInputValue("");
      } catch (err) {
        console.error("Create chat failed:", err);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`flex-1 flex flex-col relative ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      }`}
    >
      {/* Mobile Menu Button */}
      <div className="md:hidden absolute top-4 left-4 z-10">
        <button 
          onClick={onMenuClick}
          className={`p-2 rounded-lg shadow-sm backdrop-blur-sm ${
            theme === "dark" 
              ? "bg-gray-800/80 text-gray-300 hover:bg-gray-700" 
              : "bg-white/80 text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="text-center">
          <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-2xl border ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-500 to-gray-700 border-gray-600"
              : "bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-400/30"
          }`}>
            <span className={`text-xl font-bold ${theme === "dark" ? "text-gray-100" : "text-black"}`}>AI</span>
          </div>
          <h2
            className={`text-3xl md:text-4xl font-bold mb-3 md:mb-4 leading-tight ${
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}
          >
            The world's most powerful AI.
          </h2>
          <p
            className={`mb-8 md:mb-12 max-w-lg mx-auto text-base md:text-lg px-4 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Ask anything. Get answers instantly.
            <span className={`font-medium ${theme === "dark" ? "text-gray-300" : "text-cyan-500"}`}> Free forever.</span>
          </p>
        </div>
      </div>

      <div className="px-4 md:px-12 pb-8 md:pb-12 w-full">
        <div className="max-w-3xl mx-auto relative w-full">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What would you like to learn about?"
            className={`w-full p-4 md:p-6 pr-16 md:pr-20 pt-6 md:pt-10 text-base md:text-lg border rounded-2xl resize-none focus:outline-none focus:ring-2 transition-all duration-200 shadow-inner hover:shadow-lg min-h-[100px] ${
              theme === "dark"
                ? "bg-gray-800/50 border-gray-700/50 focus:ring-gray-600 focus:border-gray-500 placeholder-gray-500 text-gray-100"
                : "bg-gray-100/50 border-gray-300/50 focus:ring-cyan-500/50 focus:border-cyan-500/50 placeholder-gray-500 text-gray-900"
            }`}
            rows="3"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || api.loading}
            className={`absolute bottom-4 right-4 md:bottom-6 md:right-6 p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all w-11 h-11 md:w-12 md:h-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-white ${
              theme === "dark"
                ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            }`}
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
  );
};

export default NewChatContent;
