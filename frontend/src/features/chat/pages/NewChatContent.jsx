import React, { useState } from "react";
import { useChatAPI } from "../service/chat.api";
import { useDispatch, useSelector } from "react-redux";
import { setChats } from "../chat.slice";
import { useNavigate } from "react-router";

const NewChatContent = () => {
  const api = useChatAPI();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chats } = useSelector((state) => state.chat);
  const [inputValue, setInputValue] = useState("");
  console.log("from new chat", chats);

  const handleSend = async () => {
    if (inputValue.trim()) {
      try {
        const result = await api.createChat(inputValue.trim());
        const newChat = {
          id: result.chatId,
          title: result.title,
          updated: "Just now",
        };
        dispatch(setChats([newChat, ...chats]));
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
            placeholder="What would you like to learn about? e.g. 'Explain quantum entanglement'"
            className="w-full p-6 pr-20 pt-10 text-lg bg-gray-950/50 border border-gray-800/50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 placeholder-gray-500 backdrop-blur-sm shadow-inner min-h-[100px] transition-all duration-200 hover:shadow-lg"
            rows="3"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || api.loading}
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
  );
};

export default NewChatContent;
