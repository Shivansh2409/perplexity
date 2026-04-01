import chatModel from "../models/chats.model.js";
import messageModel from "../models/messages.model.js";
import {
  generateChatTitle,
  generateEmbeddings,
  generateResponse,
} from "../service/ai.service.js";

export async function createChat(req, res) {
  try {
    const { content } = req.body;

    const userId = req.user.id;
    console.log(userId);

    const title = await generateChatTitle(content);

    const chat = await chatModel.create({
      createdBy: userId,
      participants: [userId],
      title: title,
    });

    const message = await messageModel.create({
      chatroom: chat._id,
      owner: userId,
      content: content,
      sender: "user",
    });

    const aiResponse = await generateResponse(content);
    console.log(aiResponse);

    await messageModel.create({
      chatroom: chat._id,
      owner: userId,
      content: aiResponse,
      sender: "bot",
    });

    res.status(201).json({
      message: "Chat created successfully",
      success: true,
      chatId: chat._id,
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(401)
      .json({ message: "[createChat route]:-Error creating chat" });
  }
}
