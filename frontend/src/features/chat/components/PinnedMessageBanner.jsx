import React, { useState, useEffect } from "react";
// import { messageApi } from "../service/chat.api";
import "./PinnedMessageBanner.css";

export const PinnedMessageBanner = ({ chatId, token, isChatOwner }) => {
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPinnedMessages = async () => {
      if (!chatId || !token) return;

      try {
        setLoading(true);
        const data = await messageApi.getPinnedMessages(chatId, token);
        setPinnedMessages(data.pinnedMessages || []);
      } catch (error) {
        console.error("Failed to fetch pinned messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPinnedMessages();
  }, [chatId, token]);

  if (loading || pinnedMessages.length === 0) {
    return null;
  }

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

  const handleUnpin = async () => {
    try {
      await messageApi.unpinMessage(currentMessage._id, token);
      const updated = pinnedMessages.filter(
        (m) => m._id !== currentMessage._id,
      );
      setPinnedMessages(updated);
      if (currentIndex >= updated.length && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    } catch (error) {
      console.error("Failed to unpin message:", error);
    }
  };

  return (
    <div className="pinned-message-banner">
      <div className="pinned-header">
        <span className="pin-icon">📌 Pinned</span>
        <span className="pin-count">
          {currentIndex + 1} / {pinnedMessages.length}
        </span>
      </div>

      <div className="pinned-content">
        <button
          className="nav-btn prev-btn"
          onClick={handlePrevious}
          disabled={pinnedMessages.length <= 1}
        >
          ‹
        </button>

        <div className="message-preview">
          <p className="preview-text">{currentMessage.content}</p>
          {currentMessage.isEdited && (
            <span className="edited-label">(edited)</span>
          )}
        </div>

        <button
          className="nav-btn next-btn"
          onClick={handleNext}
          disabled={pinnedMessages.length <= 1}
        >
          ›
        </button>
      </div>

      {isChatOwner && (
        <button
          className="unpin-btn"
          onClick={handleUnpin}
          title="Unpin this message"
        >
          ✕
        </button>
      )}
    </div>
  );
};
