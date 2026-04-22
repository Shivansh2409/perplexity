import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Share2, Lock, Menu } from "lucide-react";
import ShareChatModal from "../../access/components/ShareChatModal";
import AccessRequestNotification from "../../access/components/AccessRequestNotification";
import { submitAccessRequest } from "../../access/access.slice";
import Markdown from "react-markdown";

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
  onMenuClick,
}) => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);
  const [showShareModal, setShowShareModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const { loading: accessLoading } = useSelector((state) => state.access);

  const handleRequestAccess = async () => {
    try {
      await dispatch(submitAccessRequest(chatId)).unwrap();
      setRequestSent(true);
    } catch (err) {
      console.error(err);
    }
  };

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
      <header className={`sticky top-0 z-20 ${theme === "dark" ? "bg-gray-900/80 border-gray-800/60" : "bg-white border-gray-200"} px-4 md:px-6 py-4 backdrop-blur-md shadow-lg border-b`}>
        <div className="flex flex-1 items-center gap-3 md:gap-4 max-w-7xl mx-auto">
          <button 
            onClick={onMenuClick}
            className={`md:hidden p-1.5 rounded-lg flex-shrink-0 ${theme === "dark" ? "text-gray-300 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <h1 className={`text-xl font-bold truncate ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
              <Markdown>{title}</Markdown>
            </h1>
            <p className={`truncate text-sm  flex items-center gap-2 flex-wrap ${theme === "dark" ? "text-gray-400" : "text-gray-900"}`}>
              {participantCount} participant{participantCount !== 1 ? "s" : ""}
              {isOwner && (
                <span className= {`px-2 py-0.5 text-xs rounded-full font-mono ml-1 ${theme === "dark" ? "border-green-500/30 bg-green-500/20 text-green-400" : "border-green-500/30 text-green-400"}`}>
                  • You own this
                </span>
              )}
            </p>
          </div>

          {typingText && (
            <div className={`hidden sm:flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium ml-auto ${theme === "dark" ? "border-gray-600 bg-gray-800/50 text-gray-300" : "border-cyan-500/30 bg-cyan-500/10 text-cyan-500"}`}>
              <span>{typingText}</span>
              <div className="flex gap-1">
                <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0s] ${theme === "dark" ? "bg-gray-400" : "bg-cyan-400"}`}></span>
                <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s] ${theme === "dark" ? "bg-gray-400" : "bg-cyan-400"}`}></span>
                <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s] ${theme === "dark" ? "bg-gray-400" : "bg-cyan-400"}`}></span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 ml-auto">
            {/* Access Request Notification */}
            {isOwner && <AccessRequestNotification />}

            {/* Share Button (for owners only) */}
            {isOwner && chatId && (
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 bg-gray-800/50 hover:bg-gray-700 border border-gray-600 hover:border-gray-400 text-gray-300 text-xs md:text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                title="Share this chat"
              >
                <Share2 size={16} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">Share</span>
              </button>
            )}

            {/* Request Access Button */}
            {!isOwner && permission === "no-access" && (
              <button
                onClick={handleRequestAccess}
                disabled={requestSent || accessLoading}
                className= {`flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-xl transition-all shadow-sm whitespace-nowrap ${requestSent
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : theme === "dark" 
                      ? "bg-gray-800/50 hover:bg-gray-700 border border-gray-600 hover:border-gray-400 text-gray-300"
                      : "bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600"
                }`}
                title="Request access to this chat"
              >
                <Lock size={16} />
                <span className="hidden sm:inline">{requestSent ? "Request Sent" : "Request Access"}</span>
                <span className="sm:hidden">{requestSent ? "Sent" : "Request"}</span>
              </button>
            )}

            {/* Permission Indicator */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-gray-800/50 border border-gray-600 rounded-full text-xs font-medium text-gray-200">
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
