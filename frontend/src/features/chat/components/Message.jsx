import React, { useState } from "react";
import { useSelector } from "react-redux";
import { MessageReactions } from "./MessageReactions";
import { MessageActionsMenu } from "./MessageActionsMenu";
import "./Message.css";

/**
 * Message Component
 * Displays a single message in the chat with reactions, reactions, and actions
 * Minimal, clean design aligned with Perplexity aesthetics
 */
export const Message = ({
  message,
  isCurrentUser,
  onReactionUpdate,
  onEdit,
  onDelete,
}) => {
  const {
    content,
    sender,
    createdAt,
    isPinned,
    savedBy,
    reactions = {},
    isEdited,
    editedAt,
    _id,
    owner,
  } = message;
  const { user, token } = useSelector((state) => state.auth);
  const { isOwner: isChatOwner } = useSelector((state) => state.chat);
  const [showActions, setShowActions] = useState(false);

  const isSavedByUser = savedBy && savedBy.includes(user?.id);
  const isMessageOwner = owner === user?.id;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReactionUpdate = () => {
    onReactionUpdate && onReactionUpdate();
  };

  return (
    <div
      className={`message ${isCurrentUser ? "user-message" : "bot-message"} ${
        isPinned ? "pinned-message" : ""
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Pinned indicator */}
      {isPinned && (
        <div className="pinned-indicator">
          <span className="pin-icon">📌</span>
          <span className="pin-label">Pinned</span>
        </div>
      )}

      <div className="message-content">
        <p className="message-text">{content}</p>
        <div className="message-info">
          <span className="message-time">{formatTime(createdAt)}</span>
          {isEdited && (
            <span className="edited-info">
              edited{" "}
              {new Date(editedAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          {isSavedByUser && <span className="saved-indicator">💾 Saved</span>}
        </div>
      </div>

      <div className="message-actions-section">
        {/* Reactions */}
        {Object.keys(reactions).length > 0 && (
          <div className="message-reactions-container">
            <MessageReactions
              messageId={_id}
              reactions={reactions}
              token={token}
              onReactionUpdate={handleReactionUpdate}
            />
          </div>
        )}

        {/* Actions Menu */}
        {showActions && (
          <MessageActionsMenu
            messageId={_id}
            messageContent={content}
            isPinned={isPinned}
            isSaved={isSavedByUser}
            isOwner={isMessageOwner}
            isChatOwner={isChatOwner}
            token={token}
            onPin={() => onReactionUpdate && onReactionUpdate()}
            onSave={() => onReactionUpdate && onReactionUpdate()}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}

        {/* Add reaction button always visible on hover */}
        {showActions && (
          <div className="quick-reaction">
            <MessageReactions
              messageId={_id}
              reactions={{}}
              token={token}
              onReactionUpdate={handleReactionUpdate}
            />
          </div>
        )}
      </div>

      <div className="message-sender-badge">
        {sender === "bot" ? "Bot" : "You"}
      </div>
    </div>
  );
};

export default Message;
