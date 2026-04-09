import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Message from "./Message";
import { PinnedMessageBanner } from "./PinnedMessageBanner";
import { SavedMessagesPanel } from "./SavedMessagesPanel";
import "./MessageList.css";

/**
 * MessageList Component
 * Displays all messages with pinned messages banner and unique features
 * Auto-scrolls to latest message
 */
export const MessageList = ({ messages, chatId }) => {
  const { user, token } = useSelector((state) => state.auth);
  const { isOwner } = useSelector((state) => state.chat);
  const theme = useSelector((state) => state.theme.mode);
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const [showSavedPanel, setShowSavedPanel] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMessageUpdate = () => {
    // Trigger a refresh of messages to see updated reactions, pins, etc.
    // This would typically come from socket.io event
    console.log("Message updated");
  };

  const handleMessageEdit = (messageId, newContent) => {
    console.log("Message edited:", messageId, newContent);
  };

  const handleMessageDelete = (messageId) => {
    console.log("Message deleted:", messageId);
  };

  return (
    <>
      <div
        className={`message-list ${theme === "dark" ? "dark-theme" : "light-theme"}`}
      >
        {/* Pinned Messages Banner */}
        {chatId && (
          <div className="banner-container">
            <PinnedMessageBanner
              chatId={chatId}
              token={token}
              isChatOwner={isOwner}
            />
          </div>
        )}

        <div className="messages-container">
          {messages && messages.length > 0 ? (
            messages.map((message) => (
              <Message
                key={message._id}
                message={message}
                isCurrentUser={message.owner === user?.id}
                onReactionUpdate={handleMessageUpdate}
                onEdit={handleMessageEdit}
                onDelete={handleMessageDelete}
              />
            ))
          ) : (
            <div
              className={`empty-state ${theme === "dark" ? "dark-theme" : "light-theme"}`}
            >
              <p className="empty-state-text">Start a conversation</p>
              <p className="empty-state-subtext">Send a message to begin</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Saved Messages Button */}
        <div className="message-list-footer">
          <button
            className={`saved-messages-btn ${theme === "dark" ? "dark-theme" : "light-theme"}`}
            onClick={() => setShowSavedPanel(true)}
            title="View saved messages"
          >
            💾 Saved Messages
          </button>
        </div>
      </div>

      {/* Saved Messages Panel */}
      <SavedMessagesPanel
        isOpen={showSavedPanel}
        onClose={() => setShowSavedPanel(false)}
        token={token}
      />
    </>
  );
};

export default MessageList;
