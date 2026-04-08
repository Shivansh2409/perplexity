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
import { AccessRequestNotification } from "../components/AccessRequestNotification";

const ChatContent = () => {
  const { chatId } = useParams();
  const dispatch = useDispatch();
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
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a]">
      {/* Access Request Notifications */}
      {accessRequests && accessRequests.length > 0 && (
        <div className="border-b border-gray-900 p-3 space-y-2 bg-gray-950/30">
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
        <div className="w-80 border-l border-gray-900 bg-gray-950/30 flex flex-col">
          {/* Panel Toggle Buttons */}
          <div className="p-4 border-b border-gray-900 flex gap-2">
            <button
              onClick={() => dispatch(toggleSavedMessages())}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                showSavedMessages
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 border"
                  : "bg-gray-900/50 text-gray-400 hover:bg-gray-900 border border-gray-800"
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
                    : "bg-gray-900/50 text-gray-400 hover:bg-gray-900 border border-gray-800"
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
              <div className="p-4 text-gray-500 text-sm text-center">
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
