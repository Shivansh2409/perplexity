import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { loadChat, addMessage, setCurrentChat } from "../chat.slice";
import { ChevronLeft } from "lucide-react";

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentChat, currentMessages, loading } = useSelector(
    (state) => state.chat,
  );

  useEffect(() => {
    dispatch(loadChat(chatId));
  }, [dispatch, chatId]);

  const handleSend = (content) => {
    // Mock send
    const mockAiResponse =
      "This is a mock AI response from Redux-integrated chat!";
    setTimeout(() => {
      dispatch(
        addMessage({
          id: `msg-${Date.now()}`,
          content: mockAiResponse,
          sender: "bot",
          timestamp: new Date().toISOString(),
        }),
      );
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0a0a0a] text-white items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col realative">
      {/* Header */}
      <div className="p-6 border-b border-gray-900 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-gray-900 rounded-xl"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">{currentChat?.title || chatId}</h1>
          <p className="text-sm text-gray-500">
            {currentMessages.length} messages
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 ">
        {currentMessages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-6 ${msg.sender === "bot" ? "text-left" : "text-right"}`}
          >
            <div
              className={`inline-block max-w-md p-4 rounded-2xl ${msg.sender === "bot" ? "bg-gray-900/50 backdrop-blur-sm rounded-br-sm" : "bg-gradient-to-r from-cyan-500 to-blue-600 rounded-bl-sm"}`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {currentMessages.length === 0 && (
          <div className="text-center text-gray-500 py-20">
            <p>Messages will appear here. Send a message to start!</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-gray-900 flex">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-3">
            <textarea
              placeholder="Type your message..."
              className="flex-1 p-4 bg-gray-950/50 border border-gray-800 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              rows="2"
              disabled={loading}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  // Integrate MessageInput component later
                  handleSend("User message from Redux chat");
                }
              }}
            />
            <button
              onClick={() => handleSend("User message from Redux chat")}
              className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 21l21-9-21 9zM20 5l-2 4-3-2-3 3-3-4-2 5h16z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
