import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useOutletContext } from "react-router";
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
import { submitAccessRequest } from "../../access/access.slice";
import { Lock } from "lucide-react";

const ChatContent = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { onMenuClick } = useOutletContext() || {};
  const theme = useSelector((state) => state.theme.mode);
  const [sending, setSending] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
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

  const handleRequestAccess = async () => {
    try {
      await dispatch(submitAccessRequest(chatId)).unwrap();
      setRequestSent(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (permission === "no-access") {
    return (
      <div className={`flex h-screen w-full items-center justify-center ${theme === "dark" ? "bg-gray-950/50 backdrop-blur-sm" : "bg-gray-100/50 backdrop-blur-sm"}`}>
        <div className={`w-full max-w-md rounded-2xl border p-8 shadow-2xl ${theme === "dark" ? "border-gray-800 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-900"}`}>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-cyan-500/20 p-4">
               <Lock className="h-8 w-8 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold">Access Required</h2>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              You don't have permission to view "{currentChat?.title || "this chat"}". Would you like to request access from the owner?
            </p>
            <button
              onClick={handleRequestAccess}
              disabled={requestSent}
              className={`mt-4 w-full rounded-xl py-3 font-medium transition-all ${
                requestSent
                  ? "bg-emerald-500/20 text-emerald-400 cursor-not-allowed"
                  : "bg-cyan-600 text-white hover:bg-cyan-500"
              }`}
            >
              {requestSent ? "Request Sent" : "Request Access"}
            </button>
            <button onClick={() => navigate("/")} className="mt-2 text-sm text-gray-500 hover:text-gray-400">
               Go Back Home
            </button>
          </div>
        </div>
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
        onMenuClick={onMenuClick}
      />

      <div
        className={`flex items-center flex-wrap gap-2 border-b px-4 py-3 ${
          theme === "dark"
            ? "border-gray-800 bg-gray-900/70"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <button
          onClick={() => dispatch(toggleSavedMessages())}
          className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all sm:text-sm ${
            showSavedMessages
              ? theme === "dark" ? "border-gray-600 bg-gray-700 text-gray-200" : "border-cyan-500/30 bg-cyan-500/20 text-cyan-400"
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
                ? theme === "dark" ? "border-gray-600 bg-gray-700 text-gray-200" : "border-cyan-500/30 bg-cyan-500/20 text-cyan-400"
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
