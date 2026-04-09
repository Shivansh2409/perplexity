import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, X, Bell } from "lucide-react";
import {
  fetchPendingRequests,
  approveAccessRequest,
  rejectAccessRequest,
} from "../access.slice";

/**
 * AccessRequestNotification Component
 * Shows access requests notification badge and popup
 * Allows approve/reject actions in-place
 */
export const AccessRequestNotification = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);
  const { pendingRequests, loading } = useSelector((state) => state.access);
  const [showDropdown, setShowDropdown] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    dispatch(fetchPendingRequests());
  }, [dispatch]);

  const handleApprove = async (requestId) => {
    setResolvingId(requestId);
    try {
      await dispatch(approveAccessRequest(requestId)).unwrap();
      // Refresh requests
      dispatch(fetchPendingRequests());
    } catch (err) {
      console.error("Failed to approve:", err);
    } finally {
      setResolvingId(null);
    }
  };

  const handleReject = async (requestId) => {
    setResolvingId(requestId);
    try {
      await dispatch(rejectAccessRequest(requestId)).unwrap();
      // Refresh requests
      dispatch(fetchPendingRequests());
    } catch (err) {
      console.error("Failed to reject:", err);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2 rounded-lg transition-all ${
          theme === "dark"
            ? "hover:bg-gray-800 text-gray-400 hover:text-white"
            : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
        }`}
        title="Access requests"
      >
        <Bell size={20} />
        {pendingRequests.length > 0 && (
          <span
            className={`absolute top-1 right-1 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
              theme === "dark"
                ? "bg-red-600 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {pendingRequests.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div
          className={`absolute top-12 right-0 w-96 rounded-lg shadow-lg border z-50 ${
            theme === "dark"
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Header */}
          <div
            className={`px-4 py-3 border-b font-semibold ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            Access Requests ({pendingRequests.length})
          </div>

          {/* Requests List */}
          <div className="max-h-80 overflow-y-auto">
            {pendingRequests.length === 0 ? (
              <div
                className={`px-4 py-8 text-center ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <p>No pending requests</p>
              </div>
            ) : (
              pendingRequests.map((request) => (
                <div
                  key={request._id}
                  className={`px-4 py-3 border-b transition-colors ${
                    theme === "dark"
                      ? "border-gray-700 hover:bg-gray-800"
                      : "border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {request.requester?.username || "Unknown User"}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        wants to access{" "}
                        <strong>{request.chat?.title || "Chat"}</strong>
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-shrink-0 ml-2">
                      <button
                        onClick={() => handleApprove(request._id)}
                        disabled={resolvingId === request._id || loading}
                        className={`p-2 rounded transition-all ${
                          theme === "dark"
                            ? "bg-green-600/20 hover:bg-green-600/30 text-green-400 disabled:opacity-50"
                            : "bg-green-100 hover:bg-green-200 text-green-700 disabled:opacity-50"
                        }`}
                        title="Approve"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleReject(request._id)}
                        disabled={resolvingId === request._id || loading}
                        className={`p-2 rounded transition-all ${
                          theme === "dark"
                            ? "bg-red-600/20 hover:bg-red-600/30 text-red-400 disabled:opacity-50"
                            : "bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-50"
                        }`}
                        title="Reject"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessRequestNotification;
