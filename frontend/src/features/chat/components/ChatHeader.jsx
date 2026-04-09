import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Share2 } from "lucide-react";
import ShareChatModal from "../../access/components/ShareChatModal";
import AccessRequestNotification from "../../access/components/AccessRequestNotification";
import "./ChatHeader.css";

/**
 * ChatHeader Component
 * Displays chat title, status, and typing indicators
 * Minimal design aligned with Perplexity aesthetics
 */
export const ChatHeader = ({
  title = "Chat",
  chatId = null,
  typingUsers = {},
  participantCount = 0,
  isOwner = false,
  permission = "no-access",
  connected = false,
}) => {
  const theme = useSelector((state) => state.theme.mode);
  const [showShareModal, setShowShareModal] = useState(false);

  const getTypingText = () => {
    const names = Object.values(typingUsers);
    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names.join(" and ")} are typing...`;
    return `${names.length} people are typing...`;
  };

  const typingText = getTypingText();

  return (
    <>
      <header
        className={`chat-header ${theme === "dark" ? "dark-theme" : "light-theme"}`}
      >
        <div className="chat-header-content">
          <div className="chat-title-section">
            <h1 className="chat-title">{title}</h1>
            <p className="chat-meta">
              {participantCount} participant{participantCount !== 1 ? "s" : ""}
              {isOwner && (
                <span className="owner-indicator">• You own this</span>
              )}
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

          <div className="header-actions">
            {/* Access Request Notification */}
            {isOwner && <AccessRequestNotification />}

            {/* Share Button (for owners only) */}
            {isOwner && chatId && (
              <button
                onClick={() => setShowShareModal(true)}
                className={`share-btn ${theme === "dark" ? "dark-theme" : "light-theme"}`}
                title="Share this chat"
              >
                <Share2 size={20} />
                <span>Share</span>
              </button>
            )}

            {/* Permission Indicator */}
            <div className="permission-indicator">
              <span
                className={`permission-badge ${permission.replace("-", "-")}`}
              >
                {permission === "no-access"
                  ? "No Access"
                  : permission === "view-only"
                    ? "View Only"
                    : "Edit Access"}
              </span>
            </div>

            {/* Connection Status */}
            <div
              className={`connection-status ${connected ? "connected" : "offline"}`}
            >
              <span
                className={`status-indicator ${connected ? "live" : "offline"}`}
              ></span>
              <span className="text-sm">{connected ? "Live" : "Offline"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Share Modal */}
      <ShareChatModal
        chatId={chatId}
        chatTitle={title}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </>
  );
};

export default ChatHeader;
