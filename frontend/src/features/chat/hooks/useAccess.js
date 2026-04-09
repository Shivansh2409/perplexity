import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useChatAPI } from "../service/chat.api";
import socketManager from "../../config/socket";
import { setChats } from "../chat.slice";

export const useAccess = () => {
  const api = useChatAPI();
  const dispatch = useDispatch();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const loadPendingRequests = useCallback(async () => {
    try {
      const data = await api.getPendingRequests();
      setPendingRequests(data.requests || []);
    } catch (error) {
      console.error("Load pending requests failed:", error);
    }
  }, [api]);

  const updateRequestStatus = useCallback(
    async (requestId, status) => {
      return api.updateRequestStatus(requestId, status);
    },
    [api],
  );

  const updateUserPermission = useCallback(
    async (chatId, userId, permission) => {
      return api.updateUserPermission(chatId, userId, permission);
    },
    [api],
  );

  const getUserPermission = useCallback(
    async (chatId) => {
      return api.getUserPermission(chatId);
    },
    [api],
  );

  useEffect(() => {
    socketManager.connect().catch(console.error);

    const handleAccessRequestReceived = (data) => {
      setNotifications((prev) => [
        ...prev,
        {
          type: "request_received",
          ...data,
          timestamp: Date.now(),
        },
      ]);
    };

    const handleAccessGranted = ({ chatId, title, permission }) => {
      const newChat = {
        id: chatId,
        title: title || "New Shared Chat",
        updated: new Date().toLocaleString(),
      };
      dispatch(setChats([newChat]));

      setNotifications((prev) => [
        ...prev,
        {
          type: "access_granted",
          chatId,
          title,
          permission,
          timestamp: Date.now(),
        },
      ]);
    };

    socketManager.onAccessRequest(handleAccessRequestReceived);
    socketManager.onAccessGranted(handleAccessGranted);

    loadPendingRequests();

    return () => {
      socketManager.removeListener(
        "access_request_received",
        handleAccessRequestReceived,
      );
      socketManager.removeListener("access_granted", handleAccessGranted);
    };
  }, [dispatch, loadPendingRequests]);

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.timestamp !== id));
  };

  return {
    pendingRequests,
    notifications,
    loadPendingRequests,
    updateRequestStatus,
    updateUserPermission,
    getUserPermission,
    clearNotification,
  };
};

export default useAccess;
