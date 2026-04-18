import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import useMessages from "../hooks/useMessages";

export const PinnedMessageBanner = ({ chatId, isChatOwner, onUnpin }) => {
  const { getPinnedMessages, unpinMessage } = useMessages();
  const theme = useSelector((state) => state.theme.mode);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPinnedMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      setLoading(true);
      const data = await getPinnedMessages(chatId);
      setPinnedMessages(data.pinnedMessages || data.message || []);
    } catch (error) {
      console.error("Pinned messages fetch failed:", error);
    } finally {
      setLoading(false);
    }
  }, [chatId, getPinnedMessages]);

  useEffect(() => {
    fetchPinnedMessages();
  }, [fetchPinnedMessages]);

  const currentMessage = pinnedMessages[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? pinnedMessages.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === pinnedMessages.length - 1 ? 0 : prev + 1,
    );
  };

  const handleUnpinCurrent = async () => {
    if (!currentMessage || !isChatOwner) return;

    try {
      setLoading(true);
      // Call unpin via messages hook
      await unpinMessage(currentMessage._id);

      // Update local state
      const updated = pinnedMessages.filter(
        (m) => m._id !== currentMessage._id,
      );
      setPinnedMessages(updated);

      if (updated.length === 0) {
        onUnpin && onUnpin();
      } else if (currentIndex >= updated.length && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    } catch (error) {
      console.error("Unpin failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || pinnedMessages.length === 0) return null;

  return (
    <div className={`pinned-message-banner fixed top-20 left-80 right-0 z-40 border-b backdrop-blur-xl shadow-2xl transition-colors ${
      theme === "dark" 
        ? "bg-gradient-to-r from-gray-900/95 to-gray-950/95 border-gray-800/50" 
        : "bg-gradient-to-r from-white/95 to-gray-50/95 border-gray-200"
    }`}>
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Pin indicator */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-2 border-blue-500/30 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm">
            <span className="text-lg font-bold text-blue-400">📌</span>
          </div>
          <div>
            <div className={`flex items-center gap-2 text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              <span>Pinned message</span>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30 font-mono">
                {currentIndex + 1} / {pinnedMessages.length}
              </span>
            </div>
            <p className={`text-sm max-w-md line-clamp-2 leading-tight ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
              {currentMessage?.content}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            className="nav-btn p-2 hover:bg-white/10 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePrevious}
            disabled={pinnedMessages.length <= 1 || loading}
            title="Previous pinned"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            className="nav-btn p-2 hover:bg-white/10 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleNext}
            disabled={pinnedMessages.length <= 1 || loading}
            title="Next pinned"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {isChatOwner && (
            <button
              className="unpin-btn ml-4 p-2.5 hover:bg-red-500/20 hover:border-red-500/50 border border-transparent rounded-xl text-red-400 hover:text-red-300 shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 text-sm font-medium backdrop-blur-sm"
              onClick={handleUnpinCurrent}
              disabled={loading}
              title="Unpin current message"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>✕ Unpin</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
