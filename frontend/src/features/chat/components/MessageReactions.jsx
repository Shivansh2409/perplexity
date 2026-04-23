import React, { useState } from "react";
import socketManager from "../../config/socket";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🎉", "🔥", "✨", "🙌", "👏"];

export const MessageReactions = ({
  chatId,
  messageId,
  reactions = {},
  currentUserId,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReaction = async (emoji) => {
    try {
      setLoading(true);
      const users = reactions[emoji];
      const hasReacted = Array.isArray(users) && users.some(u => 
        (typeof u === 'object' ? u._id === currentUserId || u.id === currentUserId : u === currentUserId)
      );

      if (hasReacted) {
        socketManager.removeReaction(chatId, messageId, emoji);
      } else {
        socketManager.addReaction(chatId, messageId, emoji);
      }
    } catch (error) {
      console.error("Reaction failed:", error);
    } finally {
      setLoading(false);
      setShowPicker(false);
    }
  };

  return (
    <div className="message-reactions-wrapper relative flex items-center gap-1 z-10">
      {/* Existing reactions */}
      {Object.entries(reactions).map(([emoji, users]) => {
        const count = Array.isArray(users) ? users.length : 0;
        const tooltip = Array.isArray(users)
          ? users.map(u => (typeof u === 'object' && u.username) ? u.username : "Someone").join(', ')
          : "";

        return (
          <button
            key={emoji}
            className="reaction-btn flex items-center gap-1 px-2 py-1 text-xs bg-gray-900/80 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-full transition-all shadow-sm hover:shadow-md text-white min-w-[32px] justify-center backdrop-blur-sm"
            onClick={() => handleReaction(emoji)}
            disabled={loading}
            title={tooltip ? `${emoji} from ${tooltip}` : `Toggle ${emoji} reaction`}
          >
            <span>{emoji}</span>
            <span className="count font-mono text-[10px] ml-0.5">{count}</span>
          </button>
        );
      })}

      {/* Add reaction button */}
      <div className="add-reaction-container relative">
        <button
          className="add-reaction-btn flex items-center justify-center w-8 h-8 rounded-full bg-gray-900/70 hover:bg-gray-800 border border-gray-700 hover:border-gray-500 transition-all shadow-sm hover:shadow-md text-gray-400 hover:text-white text-sm z-10"
          onClick={(e) => {
            e.stopPropagation();
            !loading && setShowPicker(!showPicker);
          }}
          disabled={loading}
          title="Add reaction"
        >
          {loading ? "..." : "+"}
        </button>

        {/* Emoji picker - positioned ABOVE message */}
        {showPicker && (
          <div className="emoji-picker absolute -bottom-14  right-0 w-56 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-2 grid grid-cols-5 gap-1.5 z-50 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                className="emoji-btn w-12 h-12 rounded-xl hover:bg-gray-800/50 active:bg-gray-700 transition-all text-lg shadow-sm hover:shadow-md flex items-center justify-center group"
                onClick={() => handleReaction(emoji)}
                disabled={loading}
              >
                <span>{emoji}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
