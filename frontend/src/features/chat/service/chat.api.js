import axios from "axios";
import { useState, useCallback, useMemo as reactUseMemo } from "react";

// Base config
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const normalizedBaseUrl = API_BASE_URL.endsWith("/")
  ? API_BASE_URL
  : `${API_BASE_URL}/`;
const api = axios.create({
  baseURL: normalizedBaseUrl,
  withCredentials: true, // JWT cookies
});

// Chat & Access API Object
export const chatAPI = {
  // AUTH
  getUser: async () => api.get("auth/get-user"),

  // CHAT ROUTES
  createChat: async (content) => api.post("chat/create-chat", { content }),
  getChat: async (chatId) => api.get(`chat/get-chat/${chatId}`),
  getAllChats: async () => api.get("chat/all"),

  // Reactions
  addReaction: async (messageId, emoji) =>
    api.post(`chat/message/${messageId}/reaction`, { emoji }),
  removeReaction: async (messageId, emoji) =>
    api.delete(`chat/message/${messageId}/reaction`, { data: { emoji } }),

  // Pins
  pinMessage: async (messageId) => api.put(`chat/message/${messageId}/pin`),
  unpinMessage: async (messageId) => api.put(`chat/message/${messageId}/unpin`),
  getPinnedMessages: async (chatId) => api.get(`chat/chat/${chatId}/pinned`),

  // Saves
  saveMessage: async (messageId) => api.put(`chat/message/${messageId}/save`),
  unsaveMessage: async (messageId) =>
    api.put(`chat/message/${messageId}/unsave`),
  getSavedMessages: async () => api.get("chat/saved-messages"),

  // Edit
  editMessage: async (messageId, content) =>
    api.put(`chat/message/${messageId}/edit`, { content }),

  // ACCESS ROUTES (proper names)
  requestAccess: async (chatId) => api.post("access/request", { chatId }),
  getPendingRequests: async () => api.get("access/requests/pending"),
  updateRequestStatus: async (requestId, status, permission = "view-only") =>
    api.put(`access/requests/${requestId}`, { status, permission }),
  updateUserPermission: async (chatId, userId, permission) =>
    api.put(`access/permission/${chatId}/${userId}`, { permission }),
  getUserPermission: async (chatId) => api.get(`access/permission/${chatId}`),
};

// Custom hooks for React
export const useChatAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const withLoading = useCallback(async (fn, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(...args);
      return result.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const methods = reactUseMemo(() => ({
    // Chat
    getUser: (...args) => withLoading(chatAPI.getUser, ...args),
    createChat: (...args) => withLoading(chatAPI.createChat, ...args),
    getChat: (...args) => withLoading(chatAPI.getChat, ...args),
    getAllChats: (...args) => withLoading(chatAPI.getAllChats, ...args),

    // Messages
    addReaction: (...args) => withLoading(chatAPI.addReaction, ...args),
    pinMessage: (...args) => withLoading(chatAPI.pinMessage, ...args),
    saveMessage: (...args) => withLoading(chatAPI.saveMessage, ...args),
    editMessage: (...args) => withLoading(chatAPI.editMessage, ...args),

    // Messages - Missing methods
    removeReaction: (...args) => withLoading(chatAPI.removeReaction, ...args),
    unpinMessage: (...args) => withLoading(chatAPI.unpinMessage, ...args),
    unsaveMessage: (...args) => withLoading(chatAPI.unsaveMessage, ...args),
    getPinnedMessages: (...args) =>
      withLoading(chatAPI.getPinnedMessages, ...args),
    getSavedMessages: (...args) =>
      withLoading(chatAPI.getSavedMessages, ...args),

    // Access
    requestAccess: (...args) => withLoading(chatAPI.requestAccess, ...args),
    getPendingRequests: (...args) =>
      withLoading(chatAPI.getPendingRequests, ...args),
    updateRequestStatus: (...args) =>
      withLoading(chatAPI.updateRequestStatus, ...args),
    updateUserPermission: (...args) =>
      withLoading(chatAPI.updateUserPermission, ...args),
    getUserPermission: (...args) =>
      withLoading(chatAPI.getUserPermission, ...args),
  }), [withLoading]);

  return {
    ...methods,
    loading,
    error,
  };
};

export default chatAPI;
