import React, { useState, useEffect, useCallback } from "react";
import useMessages from "../hooks/useMessages";
import "./SavedMessagesPanel.css";

export const SavedMessagesPanel = ({ isOpen, onClose }) => {
  const { getSavedMessages, unsaveMessage } = useMessages();
  const [savedMessages, setSavedMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const fetchSavedMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSavedMessages();
      setSavedMessages(data.savedMessages || data.message || []);
    } catch (error) {
      console.error("Failed to fetch saved messages:", error);
    } finally {
      setLoading(false);
    }
  }, [getSavedMessages]);

  useEffect(() => {
    if (isOpen) {
      fetchSavedMessages();
    }
  }, [isOpen, fetchSavedMessages]);

  const handleRemove = async (messageId) => {
    try {
      setRemovingId(messageId);
      await unsaveMessage(messageId);
      setSavedMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (error) {
      console.error("Failed to unsave:", error);
    } finally {
      setRemovingId(null);
    }
  };

  const filteredMessages = savedMessages.filter((msg) =>
    msg.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <div
      className="saved-messages-overlay fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-end p-4"
      onClick={onClose}
    >
      <div
        className="saved-messages-panel w-full max-w-md h-full max-h-[90vh] bg-gray-900 border-l border-gray-800 rounded-l-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="panel-header p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-black">💾</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Saved Messages</h2>
              <p className="text-sm text-gray-400">
                {filteredMessages.length} messages
              </p>
            </div>
          </div>
          <button
            className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-white"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-800 bg-gray-950/50">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved messages..."
              className="w-full p-3 pl-10 pr-4 bg-gray-900/50 border border-gray-700 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-transparent transition-all shadow-inner"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full mr-2" />
              Loading saved messages...
            </div>
          )}

          {!loading && filteredMessages.length === 0 && (
            <div className="text-center py-20 text-gray-500 space-y-3">
              <div className="w-20 h-20 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💾</span>
              </div>
              <p className="text-lg font-medium">No saved messages</p>
              <p className="text-sm">
                Save messages by clicking the bookmark icon
              </p>
            </div>
          )}

          {!loading &&
            filteredMessages.map((message) => (
              <div
                key={message._id}
                className="saved-message-item bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:bg-gray-900/70 transition-colors shadow-sm hover:shadow-md"
              >
                <div className="message-content">
                  <p className="message-text text-sm leading-relaxed mb-2 max-h-24 overflow-y-auto">
                    {message.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="font-mono">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                    {message.isEdited && (
                      <span className="italic">(edited)</span>
                    )}
                  </div>
                </div>
                <button
                  className="remove-btn ml-auto p-1.5 hover:bg-red-500/20 rounded-lg border border-transparent hover:border-red-500/50 transition-all text-red-400 hover:text-red-300 mt-2"
                  onClick={() => handleRemove(message._id)}
                  disabled={removingId === message._id}
                  title="Remove from saved"
                >
                  {removingId === message._id ? (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "🗑️"
                  )}
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
