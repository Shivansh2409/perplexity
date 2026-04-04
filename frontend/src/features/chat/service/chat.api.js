import axios from "axios";
import { useState, useCallback } from "react";

// Base config
const api = axios.create({
  baseURL: "http://localhost:8080/api/",
  withCredentials: true, // JWT cookies
});

// Chat & Access API Object
export const chatAPI = {
  // AUTH
  getUser: async () => api.get("auth/get-user"),

  // CHAT ROUTES
  createChat: async (content) => api.post("chat/create-chat", { content }),
  flowUpChat: async (chatId, content) =>
    api.post(`chat/flow-up-chat/${chatId}`, { content }),
  getChat: async (chatId) => api.get(`chat/get-chat/${chatId}`),

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
  updateRequestStatus: async (requestId, status) =>
    api.put(`access/requests/${requestId}`, { status }),
  updateUserPermission: async (chatId, userId, permission) =>
    api.put(`access/permission/${chatId}/${userId}`, { permission }),
  getUserPermission: async (chatId) => api.get(`access/permission/${chatId}`),
};

// Custom hooks for React (w/ proper naming)
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

  return {
    // Chat
    createChat: (...args) => withLoading(chatAPI.createChat, ...args),
    flowUpChat: (...args) => withLoading(chatAPI.flowUpChat, ...args),
    getChat: (...args) => withLoading(chatAPI.getChat, ...args),

    // Messages
    addReaction: (...args) => withLoading(chatAPI.addReaction, ...args),
    pinMessage: (...args) => withLoading(chatAPI.pinMessage, ...args),
    saveMessage: (...args) => withLoading(chatAPI.saveMessage, ...args),
    editMessage: (...args) => withLoading(chatAPI.editMessage, ...args),

    // Access
    requestAccess: (...args) => withLoading(chatAPI.requestAccess, ...args),
    getPendingRequests: (...args) =>
      withLoading(chatAPI.getPendingRequests, ...args),

    loading,
    error,
  };
};

export default chatAPI;
