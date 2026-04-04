import React from "react";
import "./ChatHeader.css";

/**
 * ChatHeader Component
 * Displays chat title, status, and typing indicators
 * Minimal design aligned with Perplexity aesthetics
 */
export const ChatHeader = ({
  title = "Chat",
  typingUsers = {},
  participantCount = 0,
  isOwner = false,
  permission = "no-access",
}) => {
  const getTypingText = () => {
    const names = Object.values(typingUsers);
    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names.join(" and ")} are typing...`;
    return `${names.length} people are typing...`;
  };

  const typingText = getTypingText();

  return (
    <header className="chat-header">
      <div className="chat-header-content">
        <div className="chat-title-section">
          <h1 className="chat-title">{title}</h1>
          <p className="chat-meta">
            {participantCount} participant{participantCount !== 1 ? "s" : ""}
            {isOwner && <span className="owner-indicator">• You own this</span>}
          </p>
        </div>

        {typingText && (
          <div className="typing-indicator">
            <span className="typing-text">{typingText}</span>
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div className="permission-indicator">
          <span className={`permission-badge ${permission.replace("-", "-")}`}>
            {permission === "no-access"
              ? "No Access"
              : permission === "view-only"
                ? "View Only"
                : "Edit Access"}
          </span>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
