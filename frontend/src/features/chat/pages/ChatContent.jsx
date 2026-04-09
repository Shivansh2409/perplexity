import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { useChat } from "../hooks/useChat";
import {
  setFirstMessageContent,
  setFirstMessageSent,
  toggleSavedMessages,
  toggleParticipants,
  removeAccessRequest,
} from "../chat.slice";
import { ChatHeader } from "../components/ChatHeader";
import { MessageList } from "../components/MessageList";
import { MessageInput } from "../components/MessageInput";
import { SavedMessagesPanel } from "../components/SavedMessagesPanel";
import { ParticipantList } from "../components/ParticipantList";
import AccessRequestNotification from "../../access/components/AccessRequestNotification";

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
    accessRequests,
  } = useSelector((state) => state.chat);
  const { user, token } = useSelector((state) => state.auth);
  const { sendMessage, messages, permissions, connected } = useChat(chatId);

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
      className={`flex-1 flex flex-col ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      }`}
    >
      {/* Access Request Notifications */}
      {accessRequests && accessRequests.length > 0 && (
        <div
          className={`border-b p-3 space-y-2 ${
            theme === "dark"
              ? "border-gray-800 bg-gray-800/30"
              : "border-gray-200 bg-gray-100/30"
          }`}
        >
          {accessRequests.map((request) => (
            <AccessRequestNotification
              key={request._id}
              request={request}
              onApprove={() => console.log("Approve:", request._id)}
              onReject={() => dispatch(removeAccessRequest(request._id))}
              isLoading={false}
            />
          ))}
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex flex-1 gap-0">
        {/* Chat Main Column */}
        <div className="flex-1 flex flex-col">
          <ChatHeader
            title={currentChat?.title || chatId}
            chatId={chatId}
            permission={permissions}
            participantCount={currentMessages?.length || 0}
            isOwner={permissions === "edit"}
            connected={connected}
          />

          <MessageList messages={currentMessages} chatId={chatId} />

          <MessageInput
            onSendMessage={handleSend}
            permission={permissions}
            isLoading={sending}
          />
        </div>

        {/* Right Sidebar - Optional Panels */}
        <div
          className={`w-80 border-l flex flex-col ${
            theme === "dark"
              ? "border-gray-800 bg-gray-800/30"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          {/* Panel Toggle Buttons */}
          <div
            className={`p-4 border-b flex gap-2 ${
              theme === "dark" ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <button
              onClick={() => dispatch(toggleSavedMessages())}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                showSavedMessages
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 border"
                  : theme === "dark"
                    ? "bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600"
                    : "bg-gray-200/50 text-gray-700 hover:bg-gray-200 border border-gray-300"
              }`}
              title="Toggle saved messages"
            >
              💾 Saved (
              {
                currentMessages.filter((m) => m.savedBy?.includes(user?.id))
                  .length
              }
              )
            </button>
            {permissions === "edit" && (
              <button
                onClick={() => dispatch(toggleParticipants())}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                  showParticipants
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 border"
                    : theme === "dark"
                      ? "bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600"
                      : "bg-gray-200/50 text-gray-700 hover:bg-gray-200 border border-gray-300"
                }`}
                title="Toggle participants"
              >
                👥 Participants
              </button>
            )}
          </div>

          {/* Panels Content */}
          <div className="flex-1 overflow-y-auto">
            {showSavedMessages && (
              <SavedMessagesPanel
                isOpen={showSavedMessages}
                onClose={() => dispatch(toggleSavedMessages())}
                token={token}
              />
            )}
            {showParticipants && permissions === "edit" && (
              <div className="p-4">
                <ParticipantList
                  participants={[]}
                  permissions={{}}
                  chatOwner={currentChat?.owner}
                  isOwner={permissions === "edit"}
                  onPermissionChange={(userId, permission) =>
                    console.log("Permission changed:", userId, permission)
                  }
                  loading={false}
                />
              </div>
            )}
            {!showSavedMessages && !showParticipants && (
              <div
                className={`p-4 text-sm text-center ${
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Select a panel to view
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContent;
