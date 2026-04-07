import { generateResponse, generateEmbeddings } from "./ai.service.js";
import messageModel from "../models/messages.model.js";
import chatModel from "../models/chats.model.js";

export async function handleUserMessage(socket, content, io) {
  try {
    const chatId = socket.chat._id.toString();

    // Save user message
    const userMessage = await messageModel.create({
      chatroom: socket.chat._id,
      owner: socket.user.user._id,
      content: content,
      sender: "user",
    });

    console.log("[Socket] User message saved:", userMessage._id);

    // Emit user message to ALL clients in the room (including sender)
    const cleanUserMessage = userMessage.toObject();
    cleanUserMessage._id = cleanUserMessage._id.toString();
    io.to(chatId).emit("message", cleanUserMessage);
    console.log("[Socket] User message emitted to room:", chatId);

    // Get all messages and generate AI response
    const messages = await messageModel.find({ chatroom: chatId });
    const aiResponse = await generateResponse(messages);

    const aiMessage = await messageModel.create({
      chatroom: socket.chat._id,
      owner: socket.user.user._id,
      content: aiResponse,
      sender: "bot",
    });

    console.log("[Socket] AI message generated:", aiMessage._id);

    // Update embeddings
    const embeddings = await generateEmbeddings(messages);
    const chat = await chatModel.findById(chatId);
    chat.embedding = embeddings;
    await chat.save();

    // Emit AI message to ALL clients in the room (including sender)
    const cleanAiMessage = aiMessage.toObject();
    cleanAiMessage._id = cleanAiMessage._id.toString();
    io.to(chatId).emit("message", cleanAiMessage);
    console.log("[Socket] AI message emitted to room:", chatId);
  } catch (err) {
    console.error("[Socket] Error handling message:", err);
  }
}
