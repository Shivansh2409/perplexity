import React, { useState } from "react";
// import { messageApi } from "../service/chat.api";

const EMOJI_OPTIONS = [" 👍 ", " ❤️ ", " 😂 ", " 😮", "😢", "🎉", "🔥", "✨"];

export const MessageReactions = ({
  messageId,
  reactions = {},
  token,
  onReactionUpdate,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddReaction = async (emoji) => {
    try {
      setLoading(true);
      await messageApi.addReaction(messageId, emoji, token);
      setShowEmojiPicker(false);
      onReactionUpdate && onReactionUpdate();
    } catch (error) {
      console.error("Failed to add reaction:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveReaction = async (emoji) => {
    try {
      setLoading(true);
      await messageApi.removeReaction(messageId, emoji, token);
      onReactionUpdate && onReactionUpdate();
    } catch (error) {
      console.error("Failed to remove reaction:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="message-reactions">
      {/* Display existing reactions */}
      <div className="reactions-display">
        {Object.entries(reactions).map(([emoji, userIds]) => (
          <button
            key={emoji}
            className="reaction-button"
            onClick={() => handleRemoveReaction(emoji)}
            title={`${userIds.length} reaction${userIds.length !== 1 ? "s" : ""}`}
            disabled={loading}
          >
            <span className="emoji">{emoji}</span>
            {userIds.length > 0 && (
              <span className="count">{userIds.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Add reaction button */}
      <div className="add-reaction-wrapper">
        <button
          className="add-reaction-btn"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          disabled={loading}
          title="Add reaction"
        >
          😊
        </button>

        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className="emoji-picker">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                className="emoji-option"
                onClick={() => handleAddReaction(emoji)}
                disabled={loading}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
