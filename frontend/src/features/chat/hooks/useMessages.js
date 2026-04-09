import { useCallback } from "react";
import { useChatAPI } from "../service/chat.api";

export const useMessages = () => {
  const api = useChatAPI();

  const addReaction = useCallback(
    async (messageId, emoji) => {
      return api.addReaction(messageId, emoji);
    },
    [api],
  );

  const removeReaction = useCallback(
    async (messageId, emoji) => {
      return api.removeReaction(messageId, emoji);
    },
    [api],
  );

  const pinMessage = useCallback(
    async (messageId) => {
      return api.pinMessage(messageId);
    },
    [api],
  );

  const unpinMessage = useCallback(
    async (messageId) => {
      return api.unpinMessage(messageId);
    },
    [api],
  );

  const saveMessage = useCallback(
    async (messageId) => {
      return api.saveMessage(messageId);
    },
    [api],
  );

  const unsaveMessage = useCallback(
    async (messageId) => {
      return api.unsaveMessage(messageId);
    },
    [api],
  );

  const editMessage = useCallback(
    async (messageId, newContent) => {
      return api.editMessage(messageId, newContent);
    },
    [api],
  );

  const getPinnedMessages = useCallback(
    async (chatId) => {
      return api.getPinnedMessages(chatId);
    },
    [api],
  );

  const getSavedMessages = useCallback(async () => {
    return api.getSavedMessages();
  }, [api]);

  return {
    addReaction,
    removeReaction,
    pinMessage,
    unpinMessage,
    saveMessage,
    unsaveMessage,
    editMessage,
    getPinnedMessages,
    getSavedMessages,
  };
};

export default useMessages;
