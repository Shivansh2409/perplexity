import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { useChat } from "../hooks/useChat";
import {
  setFirstMessageContent,
  setFirstMessageSent,
  toggleSavedMessages,
  toggleParticipants,
} from "../chat.slice";
import { ChatHeader } from "../components/ChatHeader";
import { MessageList } from "../components/MessageList";
import { MessageInput } from "../components/MessageInput";
import { SavedMessagesPanel } from "../components/SavedMessagesPanel";
import { ParticipantList } from "../components/ParticipantList";
import { useChatAPI } from "../service/chat.api";

const ChatContent = () => {
  const { chatId } = useParams();
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);
  const [sending, setSending] = useState(false);
  const {
    currentMessages,
    currentChat,
    loading,
    firstMessageSent,
    firstMessageContent,
    showSavedMessages,
    showParticipants,
  } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const { sendMessage, permission, connected, loadChatData } = useChat(chatId);
  const currentUserId = user?._id || user?.id;
  const participants = currentChat?.participants || [];
  const participantCount = participants.length || currentMessages?.length || 0;
  
  const { updateUserPermission } = useChatAPI();
  const [permissionLoading, setPermissionLoading] = useState(false);

  const handlePermissionChange = async (userId, nextPermission) => {
    setPermissionLoading(true);
    try {
      await updateUserPermission(chatId, userId, nextPermission);
      await loadChatData();
    } catch (error) {
      console.error("Failed to update permission:", error);
    } finally {
      setPermissionLoading(false);
    }
  };

  //for first message persistence across chat switches
  useEffect(() => {
    const sendFirstMessage = async () => {
      setSending(true);
      console.log("useEffect");
      if (firstMessageSent) {
        try {
          dispatch(setFirstMessageSent(false));
          await sendMessage(firstMessageContent);
          console.log("firstMessageSent:-", connected, firstMessageContent);
          dispatch(setFirstMessageContent(""));
        } catch (error) {
          console.error("Send failed:", error);
        } finally {
          setSending(false);
        }
      }
    };

    // Only send when socket is connected AND first message is ready
    if (connected && firstMessageSent) {
      sendFirstMessage();
    }
  }, [connected, firstMessageSent, firstMessageContent, dispatch, sendMessage]);

  const handleSend = async (message) => {
    setSending(true);
    try {
      await sendMessage(message);
    } catch (error) {
      console.error("Send failed:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`flex h-screen items-center justify-center ${
          theme === "dark" ? "bg-gray-950 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      }`}
    >
      <ChatHeader
        title={currentChat?.title || chatId}
        chatId={chatId}
        permission={permission}
        participantCount={participantCount}
        isOwner={permission === "edit"}
        connected={connected}
      />

      <div
        className={`flex items-center gap-2 border-b px-4 py-3 ${
          theme === "dark"
            ? "border-gray-800 bg-gray-900/70"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <button
          onClick={() => dispatch(toggleSavedMessages())}
          className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all sm:text-sm ${
            showSavedMessages
              ? "border-cyan-500/30 bg-cyan-500/20 text-cyan-400"
              : theme === "dark"
                ? "border-gray-700 bg-gray-800/80 text-gray-300 hover:bg-gray-800"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Toggle saved messages"
        >
          💾 Saved (
          {currentMessages.filter((m) => m.savedBy?.includes(currentUserId)).length}
          )
        </button>
        {permission === "edit" && (
          <button
            onClick={() => dispatch(toggleParticipants())}
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all sm:text-sm ${
              showParticipants
                ? "border-cyan-500/30 bg-cyan-500/20 text-cyan-400"
                : theme === "dark"
                  ? "border-gray-700 bg-gray-800/80 text-gray-300 hover:bg-gray-800"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
            }`}
            title="Toggle participants"
          >
            👥 Participants ({participants.length})
          </button>
        )}
      </div>

      {showParticipants && permission === "edit" && (
        <div
          className={`mx-4 mt-4 rounded-xl border ${
            theme === "dark"
              ? "border-gray-800 bg-gray-800/30"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <ParticipantList
            participants={participants}
            permissions={currentChat?.permissions || {}}
            chatOwner={currentChat?.owner || currentChat?.createdBy}
            isOwner={permission === "edit"}
            onPermissionChange={handlePermissionChange}
            loading={permissionLoading}
          />
        </div>
      )}
      <MessageList
        messages={currentMessages}
        chatId={chatId}
        permission={permission}
        currentUserId={currentUserId}
        onMessageChange={loadChatData}
      />

      <MessageInput
        onSendMessage={handleSend}
        permission={permission}
        isLoading={sending}
      />

      <SavedMessagesPanel
        isOpen={showSavedMessages}
        onClose={() => dispatch(toggleSavedMessages())}
      />
    </div>
  );
};

export default ChatContent;
