import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import socketManager from "../../config/socket";
import { chatAPI } from "../service/chat.api";
import {
  addMessage,
  setCurrentChat,
  setChats,
  setLoading,
  setMessages,
  setConnected,
} from "../chat.slice";
import { useAuth } from "../../auth/hooks/useAuth";

// Standalone function - can be called directly from anywhere
export const fetchChats = async (dispatch) => {
  try {
    const response = await chatAPI.getAllChats();
    const chatsData = response.data || response;
    dispatch(setChats(chatsData.chats || []));
    return chatsData;
  } catch (error) {
    console.error("Failed to fetch chats:", error);
    throw error;
  }
};

export const useChat = (chatId) => {
  const dispatch = useDispatch();
  const { currentChat, chats, connected } = useSelector((state) => state.chat);
  // const [messages, setMessages] = useState([]);
  // const [connected, setConnected] = useState(false);
  const [permissions, setPermissions] = useState("loading");
  const [localLoading, setLocalLoading] = useState(false);

  /**
   * Helper function to get token from cookies
   * @param {string} name - Cookie name
   * @returns {string|null} - Cookie value or null
   */
  const getCookie = (name) => {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  };

  const token = getCookie("token") || localStorage.getItem("token");

  // Socket connection with proper cleanup
  useEffect(() => {
    let mounted = true;
    let cleanupSocket = false;

    if (token && chatId) {
      socketManager
        .connect(token)
        .then(() => {
          if (mounted) {
            dispatch(setConnected(true));
            socketManager.joinChatRoom(chatId);
            cleanupSocket = true;
          }
        })
        .catch(console.error);
    }

    return () => {
      mounted = false;
      // Only try to leave if we successfully joined
      if (chatId && cleanupSocket && socketManager.isConnected) {
        socketManager.leaveChatRoom(chatId);
      }
    };
  }, [token, chatId]);

  // Load chat data - CLEAN DATA (extract only data, no axios config)
  const loadChatData = useCallback(async () => {
    if (!chatId) return;

    dispatch(setLoading(true));
    setLocalLoading(true);

    try {
      const chatResponse = await chatAPI.getChat(chatId);
      // Extract only the data part, not axios config or functions
      // chatResponse.data contains: { message, chat, success }
      const chatData = chatResponse.data || chatResponse;
      const cleanChat = {
        ...chatData.chat,
      };
      dispatch(setCurrentChat(cleanChat));
      dispatch(setMessages(chatData.message || []));
      // setMessages(chatData.message || []);

      // Permission
      const permissionResponse = await chatAPI.getUserPermission(chatId);
      const permData = permissionResponse.data || permissionResponse;
      const cleanPermission = permData.permission;
      setPermissions(cleanPermission);
    } catch (error) {
      console.error("Load chat error:", error);
      setPermissions("no-access");
    } finally {
      dispatch(setLoading(false));
      setLocalLoading(false);
    }
  }, [chatId, dispatch]);

  useEffect(() => {
    loadChatData();
  }, [loadChatData]);

  // Socket listeners
  useEffect(() => {
    if (!connected) return;

    const handleNewMessage = (message) => {
      // setMessages((prev) => [...prev, message]);
      console.log(message);
      dispatch(addMessage(message));
    };

    const handleAccessGranted = ({ chatId, title, permission }) => {
      const newChat = { id: chatId, title, updated: "Just now" };
      dispatch(setChats([newChat, ...chats]));
    };

    socketManager.onMessageReceived(handleNewMessage);
    socketManager.onAccessGranted(handleAccessGranted);

    return () => {
      socketManager.removeListener("message", handleNewMessage);
      socketManager.removeListener("access_granted", handleAccessGranted);
    };
  }, [connected, dispatch, chats]);

  // Send message
  const sendMessage = async (content) => {
    if (!chatId || !content.trim() || !connected) return;

    try {
      // const response = await chatAPI.flowUpChat(chatId, content);
      socketManager.sendMessage(chatId, content);
      // return response;
    } catch (error) {
      console.error("Send message failed:", error);
      throw error;
    }
  };

  return {
    connected,
    loading: localLoading,
    permissions,
    currentChat,
    sendMessage,
    loadChatData,
  };
};

export default useChat;
