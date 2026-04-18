import React from "react";
import { useSelector } from "react-redux";

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
  const theme = useSelector((state) => state.theme.mode);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-sm transition-colors ${
      theme === "dark" ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200"
    }`}>
      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
        theme === "dark" ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-600"
      }`}>
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

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
          <strong>{requester?.username || "User"}</strong> requested access
        </p>
        <p className={`text-xs truncate ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>to chat: {chat?.title || "Unknown"}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onApprove(_id)}
          disabled={isLoading}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50"
          aria-label="Approve access request"
        >
          Approve
        </button>
        <button
          onClick={() => onReject(_id)}
          disabled={isLoading}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 ${
            theme === "dark" 
              ? "border-gray-600 text-gray-300 hover:bg-gray-700" 
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
          aria-label="Reject access request"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default AccessRequestNotification;
