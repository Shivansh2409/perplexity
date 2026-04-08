import React, { useState, useEffect } from "react";
// import { messageApi } from "../service/chat.api";
import "./SavedMessagesPanel.css";

export const SavedMessagesPanel = ({ isOpen, onClose, token }) => {
  const [savedMessages, setSavedMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchSavedMessages();
    }
  }, [isOpen, token]);

  const fetchSavedMessages = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await messageApi.getSavedMessages(token);
      setSavedMessages(data.savedMessages || []);
    } catch (error) {
      console.error("Failed to fetch saved messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (messageId) => {
    try {
      await messageApi.unsaveMessage(messageId, token);
      setSavedMessages(savedMessages.filter((m) => m._id !== messageId));
    } catch (error) {
      console.error("Failed to remove saved message:", error);
    }
  };

  const filteredMessages = savedMessages.filter((msg) =>
    msg.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <div className="saved-messages-panel">
      <div className="panel-header">
        <h2>Saved Messages</h2>
        <button className="close-btn" onClick={onClose} title="Close">
          ✕
        </button>
      </div>

      <div className="panel-search">
        <input
          type="text"
          placeholder="Search saved messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="messages-container">
        {loading && <div className="loading">Loading saved messages...</div>}

        {!loading && filteredMessages.length === 0 && (
          <div className="empty-state">
            <p className="empty-icon">💾</p>
            <p className="empty-text">
              {savedMessages.length === 0
                ? "No saved messages yet"
                : "No messages match your search"}
            </p>
          </div>
        )}

        {!loading &&
          filteredMessages.map((message) => (
            <div key={message._id} className="saved-message-item">
              <div className="message-content">
                <p className="message-text">{message.content}</p>
                {message.isEdited && (
                  <span className="edited-flag">(edited)</span>
                )}
                <span className="message-time">
                  {new Date(message.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                className="remove-btn"
                onClick={() => handleRemove(message._id)}
                title="Remove from saved"
              >
                🗑️
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SavedMessagesPanel;
