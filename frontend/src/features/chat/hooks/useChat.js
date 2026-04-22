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
  setAIChunk,
  setAIStatus,
  clearAIChunk,
  updateMessageReaction,
} from "../chat.slice";

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

export const useChat = (chatId) => {
  const dispatch = useDispatch();
  const { currentChat, connected } = useSelector((state) => state.chat);
  const currentUserId = useSelector(
    (state) => state.auth.user?._id || state.auth.user?.id,
  );
  const [localLoading, setLocalLoading] = useState(false);
  const [permission, setPermission] = useState("view-only");

  const token = getCookie("token") || localStorage.getItem("token");
  const resolvePermission = useCallback(
    (chatData) => {
      if (!currentUserId || !chatData || !chatData.chat) return "no-access";

      const chat = chatData.chat;
      const ownerId =
        chat?.owner?._id ||
        chat?.owner?.id ||
        chat?.owner ||
        chat?.createdBy?._id ||
        chat?.createdBy?.id ||
        chat?.createdBy;

      if (ownerId === currentUserId) {
        return "edit";
      }

      const participants = chat.participants || [];
      const isParticipant = participants.some(
        (p) => p === currentUserId || p._id === currentUserId || p.id === currentUserId
      );

      if (!isParticipant) {
        return "no-access";
      }

      const permissionsMap = chat.permissions || {};
      const explicitPermission = permissionsMap[currentUserId];

      if (explicitPermission) {
        return explicitPermission;
      }

      return "view-only";
    },
    [currentUserId],
  );

  // Socket connection with proper cleanup
  useEffect(() => {
    if (!token || !chatId) {
      dispatch(setConnected(false));
      return;
    }
    let cancelled = false;
    let joinedRoom = false;

    socketManager
      .connect(token)
      .then(() => {
        if (cancelled) return;
        socketManager.joinChatRoom(chatId);
        dispatch(setConnected(true));
        joinedRoom = true;
      })
      .catch((error) => {
        console.error("Socket connection failed:", error);
        if (!cancelled) {
          dispatch(setConnected(false));
        }
      });

    return () => {
      cancelled = true;
      if (joinedRoom && socketManager.isConnected) {
        socketManager.leaveChatRoom(chatId);
      }
    };
  }, [token, chatId, dispatch]);

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
      setPermission(resolvePermission(chatData));
    } catch (error) {
      console.error("Load chat error:", error);
      setPermission("no-access");
    } finally {
      dispatch(setLoading(false));
      setLocalLoading(false);
    }
  }, [chatId, dispatch, resolvePermission]);

  useEffect(() => {
    loadChatData();
  }, [loadChatData]);

  // Socket listeners
  useEffect(() => {
    if (!connected) return;

    const handleNewMessage = (message) => {
      dispatch(addMessage(message));
      if (message.sender === "bot") {
        dispatch(clearAIChunk());
        dispatch(setAIStatus("complete"));
      }
    };
    
    const handleAIChunk = (data) => {
      dispatch(setAIChunk(data.chunk));
    };

    const handleAIStatus = (data) => {
      dispatch(setAIStatus(data.status));
      if (data.status === "typing") {
        dispatch(clearAIChunk());
      }
    };

    const handleReactionUpdated = (data) => {
      dispatch(updateMessageReaction(data));
    };

    socketManager.onMessageReceived(handleNewMessage);
    socketManager.onAIChunk(handleAIChunk);
    socketManager.onAIStatus(handleAIStatus);
    socketManager.onReactionUpdated(handleReactionUpdated);

    return () => {
      socketManager.removeListener("message", handleNewMessage);
      socketManager.removeListener("ai-chunk", handleAIChunk);
      socketManager.removeListener("ai-status", handleAIStatus);
      socketManager.removeListener("reaction_updated", handleReactionUpdated);
    };
  }, [connected, dispatch]);

  // Send message
  const sendMessage = async (content) => {
    const trimmedContent = content?.trim();
    if (!chatId || !trimmedContent || !connected) {
      return;
    }
    try {

      // Send via socket (don't wait for response)
      socketManager.sendMessage(chatId, trimmedContent);
    } catch (error) {
      console.error("Send message failed:", error);
      throw error;
    }
  };

  return {
    connected,
    loading: localLoading,
    currentChat,
    permission,
    sendMessage,
    loadChatData,
  };
};

export default useChat;
