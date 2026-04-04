import React from "react";
import "./AccessRequestNotification.css";

/**
 * AccessRequestNotification Component
 * Shows a notification for pending access requests from other users
 * Allows accepting or rejecting access
 */
export const AccessRequestNotification = ({
  request,
  onApprove,
  onReject,
  isLoading = false,
}) => {
  const { _id, requester, chat } = request;

  return (
    <div className="access-request-notification">
      <div className="notification-icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>

      <div className="notification-content">
        <p className="notification-title">
          <strong>{requester?.username || "User"}</strong> requested access
        </p>
        <p className="notification-chat">to chat: {chat?.title || "Unknown"}</p>
      </div>

      <div className="notification-actions">
        <button
          onClick={() => onApprove(_id)}
          disabled={isLoading}
          className="action-button approve"
          aria-label="Approve access request"
        >
          Approve
        </button>
        <button
          onClick={() => onReject(_id)}
          disabled={isLoading}
          className="action-button reject"
          aria-label="Reject access request"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default AccessRequestNotification;
