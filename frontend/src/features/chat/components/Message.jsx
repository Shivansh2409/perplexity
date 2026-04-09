import React, { useState } from "react";
import { useSelector } from "react-redux";
import { MessageReactions } from "./MessageReactions";
import { MessageActionsMenu } from "./MessageActionsMenu";
import useMessages from "../hooks/useMessages";
import useAccess from "../hooks/useAccess";
import "./Message.css";

export default function Message({ message, isOwnMessage, chatId, onUpdate }) {
  const { user } = useSelector((state) => state.auth);
  const { permissions } = useSelector((state) => state.chat);
  const { getUserPermission } = useAccess();
  const { editMessage } = useMessages();

  const [showActions, setShowActions] = useState(false);
  const [localReactions, setLocalReactions] = useState(message.reactions || {});
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const isChatOwner = permissions === "edit";
  const isMessageOwner = message.owner === user?.id;
  const isSavedByUser = message.savedBy?.includes(user?.id);
  const isPinned = message.isPinned;

  const refreshMessage = () => {
    onUpdate && onUpdate();
  };

  const handleReactionUpdate = () => {
    refreshMessage();
  };

  const handleEdit = async () => {
    if (!editedContent.trim()) return;

    try {
      await editMessage(message._id, editedContent);
      refreshMessage();
      setIsEditing(false);
    } catch (error) {
      console.error("Edit failed:", error);
    }
  };

  return (
    <div
      className={`message-wrapper flex gap-3 mb-6 group relative transition-all duration-200 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar (bot only) */}
      {!isOwnMessage && (
        <div className="message-avatar w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
          <span className="text-sm font-bold text-black">AI</span>
        </div>
      )}

      <div
        className={`message-container max-w-[70%] transition-all duration-200 ${
          isOwnMessage
            ? "bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 backdrop-blur-sm rounded-2xl rounded-br-sm shadow-lg"
            : "bg-gray-900/60 border border-gray-800/50 backdrop-blur-sm rounded-2xl rounded-br-sm shadow-lg hover:shadow-xl"
        } p-4 hover:shadow-lg group-hover:shadow-xl`}
      >
        {/* Pinned badge */}
        {isPinned && (
          <div className="pinned-badge absolute -top-2 left-3 bg-blue-500/90 text-white text-xs px-2 py-0.5 rounded-full border border-blue-600/50 shadow-md font-medium">
            📌 Pinned
          </div>
        )}

        {/* Content */}
        <div className="message-content">
          {isEditing ? (
            <div className="edit-container">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="edit-textarea w-full p-2.5 bg-gray-950/80 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none min-h-[40px] max-h-[120px]"
                placeholder="Edit your message..."
                autoFocus
              />
              <div className="edit-buttons flex gap-2 mt-2 pt-2 border-t border-gray-800">
                <button
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-xs rounded-lg font-medium transition-colors whitespace-nowrap"
                  onClick={handleEdit}
                >
                  Save
                </button>
                <button
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-xs rounded-lg font-medium transition-colors"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(message.content);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="message-text text-sm leading-relaxed break-words max-w-full">
              {message.content}
            </p>
          )}
        </div>

        {/* Meta info */}
        <div className="message-meta flex items-center gap-3 mt-2 pt-2 border-t border-transparent group-hover:border-gray-700">
          <span className="time text-xs text-gray-500 font-mono">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {message.isEdited && (
            <span className="edited text-xs text-blue-400 italic font-mono">
              edited
            </span>
          )}

          {isSavedByUser && (
            <span className="saved-badge text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full border border-yellow-500/30 font-mono">
              💾 Saved
            </span>
          )}

          {/* Actions - hover only */}
          {showActions && (
            <div className="actions flex items-center gap-1 ml-auto">
              <MessageReactions
                messageId={message._id}
                reactions={localReactions}
                onReactionUpdate={handleReactionUpdate}
              />
              <MessageActionsMenu
                messageId={message._id}
                messageContent={message.content}
                isPinned={isPinned}
                isSaved={isSavedByUser}
                isOwner={isMessageOwner}
                isChatOwner={isChatOwner}
                onRefresh={refreshMessage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sender badge for bot messages */}
      {!isOwnMessage && (
        <div className="sender-badge bg-gradient-to-b from-gray-800 to-gray-900 text-xs px-2 py-1 rounded-lg border border-gray-700 font-medium text-gray-300 whitespace-nowrap shadow-sm">
          AI
        </div>
      )}
    </div>
  );
}
