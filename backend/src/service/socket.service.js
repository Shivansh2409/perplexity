import { generateResponse, generateEmbeddings } from "./ai.service.js";
import messageModel from "../models/messages.model.js";
import chatModel from "../models/chats.model.js";

export async function handleUserMessage(socket, content) {
  try {
    const chatId = socket.chat._id.toString();

    const message = await messageModel.create({
      chatroom: socket.chat._id,
      owner: socket.user.user._id,
      content: content,
      sender: "user",
    });

    const messages = await messageModel.find({ chatroom: chatId });
    const aiResponse = await generateResponse(messages);
    const aiMessage = await messageModel.create({
      chatroom: socket.chat._id,
      owner: socket.user.user._id,
      content: aiResponse,
      sender: "bot",
    });

    console.log(aiMessage);

    const embeddings = await generateEmbeddings(messages);
    const chat = await chatModel.findById(chatId);
    chat.embedding = embeddings;
    await chat.save();

    socket.to(chatId).emit("message", aiMessage);
  } catch (err) {
    console.error(err);
  }
}
