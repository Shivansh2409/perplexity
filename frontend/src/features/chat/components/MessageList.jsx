import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Message from "./Message";
import { PinnedMessageBanner } from "./PinnedMessageBanner";

/**
 * MessageList Component
 * Displays all messages with pinned messages banner and unique features
 * Auto-scrolls to latest message
 */
export const MessageList = ({
  messages,
  chatId,
  permission = "view-only",
  currentUserId,
  onMessageChange,
}) => {
  const theme = useSelector((state) => state.theme.mode);
  const messagesEndRef = useRef(null);
  const isOwner = permission === "edit";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMessageUpdate = () => {
    onMessageChange?.();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Pinned Messages Banner */}
      {chatId && (
        <div
          className={`border-b px-4 py-2 ${
            theme === "dark"
              ? "border-gray-800 bg-gray-900/50"
              : "border-gray-200 bg-white"
          }`}
        >
          <PinnedMessageBanner
            chatId={chatId}
            isChatOwner={isOwner}
            onUpdated={onMessageChange}
          />
        </div>
      )}

      <div
        className={`flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <Message
              key={message._id}
              message={message}
              isOwnMessage={(message.owner?._id || message.owner?.id || message.owner) === currentUserId}
              permission={permission}
              onUpdate={handleMessageUpdate}
            />
          ))
        ) : (
          <div
            className={`flex h-full flex-col items-center justify-center space-y-2 rounded-2xl border p-12 text-center ${
              theme === "dark"
                ? "border-gray-800 bg-gray-900/50 text-gray-400"
                : "border-gray-200 bg-gray-50 text-gray-500"
            }`}
          >
            <p className="text-lg font-medium">Start a conversation</p>
            <p className="text-sm">Send a message to begin</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
