import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Share2 } from "lucide-react";
import { submitAccessRequest } from "../access.slice";

/**
 * ShareChatModal Component
 * Modal to share a chat with other users
 * Shows share link and request option
 */
export const ShareChatModal = ({ chatId, chatTitle, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);
  const { loading, error } = useSelector((state) => state.access);
  const [copied, setCopied] = useState(false);

  const shareLink = `${window.location.origin}/chat/${chatId}`;

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendRequest = async () => {
    try {
      await dispatch(submitAccessRequest(chatId)).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to request access:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        style={{
          backgroundColor:
            theme === "dark" ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.3)",
        }}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none ${
          isOpen ? "" : "invisible"
        }`}
      >
        <div
          className={`pointer-events-auto w-full max-w-md rounded-lg shadow-xl border ${
            theme === "dark"
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between p-4 border-b ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <h2 className="flex items-center gap-2 font-semibold">
              <Share2 size={20} />
              Share Chat
            </h2>
            <button
              onClick={onClose}
              className={`p-1 rounded hover:bg-gray-100 ${
                theme === "dark"
                  ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                  : "text-gray-600"
              }`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Chat Title */}
            <div>
              <p
                className={`text-xs font-medium mb-2 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Sharing Chat:
              </p>
              <p
                className={`font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {chatTitle}
              </p>
            </div>

            {/* Share Link */}
            <div>
              <p
                className={`text-xs font-medium mb-2 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Share Link:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className={`flex-1 px-3 py-2 text-sm rounded border ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                />
                <button
                  onClick={handleCopyToClipboard}
                  className={`px-4 py-2 rounded font-medium text-sm transition-all ${
                    copied
                      ? theme === "dark"
                        ? "bg-green-600 text-white"
                        : "bg-green-500 text-white"
                      : theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Info */}
            <div
              className={`p-3 rounded text-sm ${
                theme === "dark"
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <p>
                Share this link with others. They can view the chat and request
                access if needed.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className={`p-3 rounded text-sm ${
                  theme === "dark"
                    ? "bg-red-600/20 text-red-400"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className={`flex gap-3 p-4 border-t ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded font-medium transition-all ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-900"
              }`}
            >
              Close
            </button>
            <button
              onClick={handleCopyToClipboard}
              className="flex-1 px-4 py-2 rounded font-medium transition-all bg-blue-600 hover:bg-blue-700 text-white"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareChatModal;
