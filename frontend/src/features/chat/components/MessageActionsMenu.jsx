import React, { useState } from "react";
// import { messageApi } from "../service/chat.api";
import "./MessageActionsMenu.css";

export const MessageActionsMenu = ({
  messageId,
  messageContent,
  isPinned,
  isSaved,
  isOwner,
  isChatOwner,
  token,
  onPin,
  onSave,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(messageContent);
  const [loading, setLoading] = useState(false);

  const handlePin = async () => {
    try {
      setLoading(true);
      if (isPinned) {
        await messageApi.unpinMessage(messageId, token);
      } else {
        await messageApi.pinMessage(messageId, token);
      }
      onPin && onPin();
      setShowMenu(false);
    } catch (error) {
      console.error("Failed to pin/unpin message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (isSaved) {
        await messageApi.unsaveMessage(messageId, token);
      } else {
        await messageApi.saveMessage(messageId, token);
      }
      onSave && onSave();
      setShowMenu(false);
    } catch (error) {
      console.error("Failed to save/unsave message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editedContent.trim()) return;

    try {
      setLoading(true);
      await messageApi.editMessage(messageId, editedContent, token);
      onEdit && onEdit(editedContent);
      setIsEditing(false);
      setShowMenu(false);
    } catch (error) {
      console.error("Failed to edit message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      onDelete && onDelete();
      setShowMenu(false);
    }
  };

  return (
    <div className="message-actions-menu">
      {/* Menu trigger button */}
      <button
        className="menu-trigger"
        onClick={() => setShowMenu(!showMenu)}
        title="Message options"
      >
        ⋮
      </button>

      {/* Dropdown menu */}
      {showMenu && (
        <div className="actions-dropdown">
          {/* Save message option - always available */}
          <button
            className={`action-item ${isSaved ? "active" : ""}`}
            onClick={handleSave}
            disabled={loading}
          >
            <span className="icon">{isSaved ? "💾" : "📌"}</span>
            <span className="label">{isSaved ? "Unsave" : "Save"}</span>
          </button>

          {/* Pin message option - only for chat owner */}
          {isChatOwner && (
            <button
              className={`action-item ${isPinned ? "active" : ""}`}
              onClick={handlePin}
              disabled={loading}
            >
              <span className="icon">{isPinned ? "📌" : "📍"}</span>
              <span className="label">{isPinned ? "Unpin" : "Pin"}</span>
            </button>
          )}

          {/* Edit message option - only for message owner */}
          {isOwner && !isEditing && (
            <button
              className="action-item"
              onClick={() => setIsEditing(true)}
              disabled={loading}
            >
              <span className="icon">✏️</span>
              <span className="label">Edit</span>
            </button>
          )}

          {/* Delete message option - only for message owner */}
          {isOwner && (
            <button
              className="action-item danger"
              onClick={handleDelete}
              disabled={loading}
            >
              <span className="icon">🗑️</span>
              <span className="label">Delete</span>
            </button>
          )}
        </div>
      )}

      {/* Edit mode */}
      {isEditing && isOwner && (
        <div className="edit-message-form">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="Edit your message..."
            className="edit-textarea"
            disabled={loading}
          />
          <div className="edit-actions">
            <button
              className="btn-save"
              onClick={handleEdit}
              disabled={loading || !editedContent.trim()}
            >
              Save
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                setIsEditing(false);
                setEditedContent(messageContent);
              }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
