import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Share2 } from "lucide-react";
import ShareChatModal from "../../access/components/ShareChatModal";
import AccessRequestNotification from "../../access/components/AccessRequestNotification";

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
      <header className="sticky top-0 z-20 bg-gray-900/95 border-b border-gray-800/50 px-6 py-4 backdrop-blur-md shadow-lg">
        <div className="flex flex-1 items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-xl font-bold truncate text-gray-100">
              {title}
            </h1>
            <p className="text-sm text-gray-400 flex items-center gap-2 flex-wrap">
              {participantCount} participant{participantCount !== 1 ? "s" : ""}
              {isOwner && (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30 font-mono ml-1">
                  • You own this
                </span>
              )}
            </p>
          </div>

          {typingText && (
            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm text-cyan-300 font-medium ml-auto">
              <span>{typingText}</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0s]"></span>
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Access Request Notification */}
            {isOwner && <AccessRequestNotification />}

            {/* Share Button (for owners only) */}
            {isOwner && chatId && (
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700 border border-gray-600 hover:border-cyan-400 text-cyan-300 text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                title="Share this chat"
              >
                <Share2 size={20} />
                <span>Share</span>
              </button>
            )}

            {/* Permission Indicator */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-800/50 border border-gray-600 rounded-full text-xs font-medium text-gray-200">
              <span
                className={`w-2 h-2 rounded-full ${permission === "edit" ? "bg-emerald-400" : permission === "view-only" ? "bg-blue-400" : "bg-gray-500"} animate-pulse inline-block`}
              ></span>
              <span>
                {permission === "no-access"
                  ? "No Access"
                  : permission === "view-only"
                    ? "View Only"
                    : "Edit"}
              </span>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm hover:shadow-md backdrop-blur-sm bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <span
                className={`w-3 h-3 rounded-full ${connected ? "bg-emerald-400 animate-ping" : "bg-gray-500 animate-pulse"}`}
              ></span>
              <span>{connected ? "Live" : "Offline"}</span>
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
