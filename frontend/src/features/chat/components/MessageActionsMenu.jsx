import React, { useState } from "react";
import { useSelector } from "react-redux";
import useMessages from "../hooks/useMessages";

export const MessageActionsMenu = ({
  messageId,
  messageContent,
  isPinned,
  isSaved,
  isOwner,
  isChatOwner,
  onRefresh,
}) => {
  const { pinMessage, unpinMessage, saveMessage, unsaveMessage, editMessage } =
    useMessages();
  const theme = useSelector((state) => state.theme.mode);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(messageContent);
  const [loading, setLoading] = useState(false);

  const handlePinToggle = async () => {
    try {
      setLoading(true);
      if (isPinned) {
        await unpinMessage(messageId);
      } else {
        await pinMessage(messageId);
      }
      onRefresh();
      setShowMenu(false);
    } catch (error) {
      console.error("Pin/Unpin failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToggle = async () => {
    try {
      setLoading(true);
      if (isSaved) {
        await unsaveMessage(messageId);
      } else {
        await saveMessage(messageId);
      }
      onRefresh();
      setShowMenu(false);
    } catch (error) {
      console.error("Save/Unsave failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editedContent.trim()) return;

    try {
      setLoading(true);
      await editMessage(messageId, editedContent);
      onRefresh(editedContent);
      setIsEditing(false);
      setShowMenu(false);
    } catch (error) {
      console.error("Edit failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    // TODO: Implement delete (backend endpoint needed)
    console.log("Delete message:", messageId);
    setShowMenu(false);
  };

  return (
    <div className="message-actions-menu">
      <button
        className={`menu-trigger rounded p-1 transition-colors ${
          theme === "dark"
            ? "hover:bg-gray-800 text-gray-300"
            : "hover:bg-gray-200 text-gray-700"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        title="Message options"
        disabled={loading}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {showMenu && (
        <div
          className={`actions-dropdown absolute right-0 z-50 mt-1 min-w-[160px] rounded-lg border py-1 shadow-2xl backdrop-blur-sm ${
            theme === "dark"
              ? "border-gray-700 bg-gray-900 text-gray-100"
              : "border-gray-200 bg-white text-gray-800"
          }`}
        >
          {/* Save */}
          <button
            className={`action-item flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
              theme === "dark" ? "hover:bg-gray-800/50" : "hover:bg-gray-100"
            }`}
            onClick={handleSaveToggle}
            disabled={loading}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded ${
                isSaved
                  ? "bg-yellow-500/20 text-yellow-400"
                  : theme === "dark"
                    ? "text-gray-400 hover:text-yellow-400"
                    : "text-gray-500 hover:text-yellow-500"
              }`}
            >
              {isSaved ? "💾" : "🔖"}
            </span>
            {isSaved ? "Unsave" : "Save"}
          </button>

          {/* Pin (chat owner only) */}
          {isChatOwner && (
            <button
              className={`action-item flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                theme === "dark" ? "hover:bg-gray-800/50" : "hover:bg-gray-100"
              }`}
              onClick={handlePinToggle}
              disabled={loading}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded ${
                  isPinned
                    ? "bg-blue-500/20 text-blue-400"
                    : theme === "dark"
                      ? "text-gray-400 hover:text-blue-400"
                      : "text-gray-500 hover:text-blue-500"
                }`}
              >
                📌
              </span>
              {isPinned ? "Unpin" : "Pin"}
            </button>
          )}

          {/* Edit (message owner) */}
          {isOwner && !isEditing && (
            <button
              className={`action-item flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                theme === "dark" ? "hover:bg-gray-800/50" : "hover:bg-gray-100"
              }`}
              onClick={() => setIsEditing(true)}
              disabled={loading}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-blue-400"
                    : "text-gray-500 hover:text-blue-500"
                }`}
              >
                ✏️
              </span>
              Edit
            </button>
          )}

          {/* Delete (message owner) */}
          {isOwner && (
            <button
              className={`action-item danger flex w-full items-center gap-2 border-t px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300 ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
              onClick={handleDelete}
              disabled={loading}
            >
              <span className="w-5 h-5 rounded flex items-center justify-center">
                🗑️
              </span>
              Delete
            </button>
          )}
        </div>
      )}

      {/* Edit form */}
      {isEditing && isOwner && (
        <div className="edit-form mt-2 p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full p-2 bg-gray-950 border border-gray-800 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none min-h-[60px] max-h-[150px]"
            placeholder="Edit message..."
            disabled={loading}
          />
          <div className="flex gap-2 mt-3">
            <button
              className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
              onClick={handleEdit}
              disabled={loading || !editedContent.trim()}
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors"
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
