import { useCallback } from "react";
import { useChatAPI } from "../service/chat.api";

export const useMessages = () => {
  const {
    addReaction,
    removeReaction,
    pinMessage,
    unpinMessage,
    saveMessage,
    unsaveMessage,
    editMessage,
    getPinnedMessages,
    getSavedMessages,
  } = useChatAPI();

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
