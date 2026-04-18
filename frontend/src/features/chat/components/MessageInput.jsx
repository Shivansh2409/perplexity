import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";

/**
 * MessageInput Component
 * Handles user message input with permission gating
 * Disabled when user only has "view-only" permission
 */
export const MessageInput = ({
  onSendMessage,
  onTyping,
  permission = "no-access",
  isLoading = false,
}) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const theme = useSelector((state) => state.theme.mode);
  const typingTimeoutRef = useRef(null);
  const isDisabled = permission === "no-access" || permission === "view-only";

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Emit typing indicator
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      onTyping?.(true);
    }

    // Clear and restart typing timeout
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping?.(false);
    }, 1500);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!message.trim() || isDisabled || isLoading) {
      return;
    }

    onSendMessage?.(message);
    setMessage("");
    setIsTyping(false);
    onTyping?.(false);
  };

  useEffect(() => {
    return () => clearTimeout(typingTimeoutRef.current);
  }, []);

  return (
    <div className={`border-t p-5 pt-4 backdrop-blur-sm transition-colors shadow-lg ${
      theme === "dark" 
        ? "border-gray-800/50 bg-gradient-to-t from-gray-950/50 to-transparent" 
        : "border-gray-200 bg-gradient-to-t from-white/90 to-transparent"
    }`}>
      <form onSubmit={handleSendMessage} className="space-y-3">
        <div className="relative flex items-end gap-2">
          <textarea
            value={message}
            onChange={handleInputChange}
            placeholder={
              isDisabled
                ? "You don't have permission to send messages"
                : "Type your message..."
            }
            disabled={isDisabled || isLoading}
            className={`flex-1 min-h-[44px] max-h-[120px] p-4 border rounded-2xl resize-none text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all shadow-inner backdrop-blur-sm ${
              theme === "dark"
                ? "bg-gray-900/50 border-gray-700 hover:border-gray-600 placeholder-gray-500 text-white"
                : "bg-white border-gray-300 hover:border-gray-400 placeholder-gray-400 text-gray-900"
            }`}
            rows={1}
          />
          <button
            type="submit"
            disabled={!message.trim() || isDisabled || isLoading}
            className="flex items-center justify-center w-11 h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0"
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg
                className="w-5 h-5 rotate-[-20deg]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
        {isDisabled && (
          <p className={`text-xs font-medium px-1 ${theme === "dark" ? "text-orange-400" : "text-orange-500"}`}>
            You have {permission === "view-only" ? "view-only" : "no"} access to
            this chat.
          </p>
        )}
      </form>
    </div>
  );
};

export default MessageInput;
