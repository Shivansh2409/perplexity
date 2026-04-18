import React, { useState } from "react";
import { useSelector } from "react-redux";
import { MessageReactions } from "./MessageReactions";
import { MessageActionsMenu } from "./MessageActionsMenu";
import { CloudCog } from "lucide-react";
import  Markdown from "react-markdown"

export default function Message({
  message,
  isOwnMessage,
  permission = "view-only",
  onUpdate,
}) {
  const { user } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme.mode);
  const currentUserId = user?._id || user?.id;

  const [showActions, setShowActions] = useState(false);

  const isChatOwner = permission === "edit";
  const isSavedByUser = message.savedBy?.includes(currentUserId);
  const isPinned = message.isPinned;
  const messageTime = message?.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const refreshMessage = () => {
    onUpdate && onUpdate();
    console.log(message)
  };

  return (
    <div
      className={`group relative mb-6 flex gap-3 transition-all duration-200 ${
        (message.sender == "user") ? "justify-end" : "justify-start"
      }`}
      
    >
      {!isOwnMessage && (
        <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm font-bold text-black">AI</span>
          </div>
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-2xl p-4 transition-all duration-200 sm:max-w-[70%] ${
          isOwnMessage
            ? theme === "dark"
              ? "rounded-br-sm border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 text-gray-100 shadow-lg"
              : "rounded-br-sm border border-blue-200 bg-gradient-to-r from-cyan-100 to-blue-100 text-gray-900 shadow"
            : theme === "dark"
              ? "rounded-bl-sm border border-gray-800/60 bg-gray-900/80 text-gray-100 shadow-lg"
              : "rounded-bl-sm border border-gray-200 bg-white text-gray-900 shadow"
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {isPinned && (
          <div className="absolute -top-2 left-3 rounded-full border border-blue-500/40 bg-blue-500/90 px-2 py-0.5 text-xs font-medium text-white shadow-md">
            📌 Pinned
          </div>
        )}

        <p className="max-w-full break-words text-sm leading-relaxed">
          {message.sender=="bot"? 
          <Markdown>{message.content}</Markdown>:
          message.content}

        </p>

        <div
          className={`mt-2 flex items-center gap-3 border-t pt-2 ${
            theme === "dark" ? "border-gray-700/40" : "border-gray-200"
          }`}
        >
          <span className="font-mono text-xs text-gray-500">{messageTime}</span>

          {message.isEdited && (
            <span className="font-mono text-xs italic text-blue-400">
              edited
            </span>
          )}

          {isSavedByUser && (
            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/20 px-1.5 py-0.5 font-mono text-xs text-yellow-400">
              💾 Saved
            </span>
          )}

          {showActions && (
            <div className="ml-auto flex items-center gap-1">
              <MessageReactions
                messageId={message._id}
                reactions={message.reactions || {}}
                onReactionUpdate={refreshMessage}
              />
              <MessageActionsMenu
                messageId={message._id}
                messageContent={message.content}
                isPinned={isPinned}
                isSaved={isSavedByUser}
                isOwner={isOwnMessage}
                isChatOwner={isChatOwner}
                onRefresh={refreshMessage}
                sender={message.sender}
              />
            </div>
          )}
        </div>
      </div>

      {(message.sender == "bot") && (
        <div
          className={`h-fit rounded-lg border px-2 py-1 text-xs font-medium shadow-sm ${
            theme === "dark"
              ? "border-gray-700 bg-gradient-to-b from-gray-800 to-gray-900 text-gray-300"
              : "border-gray-200 bg-gradient-to-b from-white to-gray-100 text-gray-700"
          }`}
        >
          AI
        </div>
      )}
    </div>
  );
}
