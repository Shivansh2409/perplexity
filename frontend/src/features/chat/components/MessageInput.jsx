import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import "./MessageInput.css";

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
    <div
      className={`message-input-container ${theme === "dark" ? "dark-theme" : "light-theme"}`}
    >
      <form onSubmit={handleSendMessage} className="message-input-form">
        <div className="input-wrapper">
          <textarea
            value={message}
            onChange={handleInputChange}
            placeholder={
              isDisabled
                ? "You don't have permission to send messages"
                : "Type your message..."
            }
            disabled={isDisabled || isLoading}
            className="message-input"
            rows={1}
          />
          <button
            type="submit"
            disabled={!message.trim() || isDisabled || isLoading}
            className="send-button"
            aria-label="Send message"
          >
            {isLoading ? (
              <span className="spinner" />
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
        {isDisabled && (
          <p className="permission-warning">
            You have {permission === "view-only" ? "view-only" : "no"} access to
            this chat.
          </p>
        )}
      </form>
    </div>
  );
};

export default MessageInput;
