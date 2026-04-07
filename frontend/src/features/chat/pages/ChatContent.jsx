import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { useChat } from "../hooks/useChat";
import { setFirstMessageContent, setFirstMessageSent } from "../chat.slice";

const ChatContent = () => {
  const { chatId } = useParams();
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const {
    currentMessages,
    currentChat,
    loading,
    firstMessageSent,
    firstMessageContent,
  } = useSelector((state) => state.chat);
  const { sendMessage, messages, permissions, connected } = useChat(chatId);

  useEffect(() => {
    const sendFirstMessage = async () => {
      setSending(true);
      console.log("useEffect");
      if (firstMessageSent) {
        try {
          dispatch(setFirstMessageSent(false));
          await sendMessage(firstMessageContent);
          console.log("firstMessageSent:-", connected, firstMessageContent);
          dispatch(setFirstMessageContent(""));
        } catch (error) {
          console.error("Send failed:", error);
        } finally {
          setSending(false);
        }
      }
    };

    // Only send when socket is connected AND first message is ready
    if (connected && firstMessageSent) {
      sendFirstMessage();
    }
  }, [connected, firstMessageSent, firstMessageContent, dispatch, sendMessage]);

  const handleSend = async () => {
    if (!inputValue.trim() || !connected || sending) return;

    setInputValue("");
    setSending(true);

    try {
      await sendMessage(inputValue);
    } catch (error) {
      console.error("Send failed:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="p-6 border-b border-gray-900 flex items-center gap-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            permissions === "edit"
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : permissions === "view-only"
                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                : "bg-gray-500/20 text-gray-400 border-gray-500/30"
          } border`}
        >
          {permissions === "edit"
            ? "Owner"
            : permissions === "view-only"
              ? "Viewer"
              : "No Access"}
        </span>
        <h1 className="text-xl font-bold">{currentChat?.title || chatId}</h1>
        <span className="text-sm text-gray-500 ml-auto">
          {connected ? "● Live" : "● Offline"}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {currentMessages.map((msg) => (
          <div
            key={msg._id || msg.id || `${msg.sender}-${msg.timestamp}`}
            className={`flex ${msg.sender === "bot" ? "" : "flex-row-reverse"}`}
          >
            <div
              className={`max-w-md p-4 rounded-2xl ${
                msg.sender === "bot"
                  ? "bg-gray-900/70 backdrop-blur-sm rounded-br-sm border border-gray-800/50 shadow-lg"
                  : "bg-gradient-to-r from-cyan-500/90 to-blue-600/90 rounded-bl-sm shadow-lg"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <div className="flex items-center gap-2 mt-2 opacity-75">
                <span className="text-xs">
                  {msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString()
                    : new Date().toLocaleTimeString()}
                </span>
                {msg.isEdited && (
                  <span className="text-xs italic text-blue-400">edited</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-900 bg-gradient-to-t from-gray-950/50">
        <div className="max-w-2xl mx-auto flex gap-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything... (Ctrl+Enter to send)"
            className="flex-1 p-4 bg-gray-950/50 border border-gray-800 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-sm shadow-inner placeholder-gray-500 backdrop-blur-sm"
            rows="1"
            disabled={sending}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey && e.ctrlKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={!connected || !inputValue.trim() || sending}
            className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 disabled:from-gray-600 disabled:to-gray-700 rounded-xl transition-all shadow-lg hover:shadow-xl text-white font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          {connected ? "Connected • Real-time" : "Connecting..."}
        </p>
      </div>
    </div>
  );
};

export default ChatContent;
