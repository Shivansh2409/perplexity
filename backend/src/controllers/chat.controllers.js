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
    const embeddings = await generateEmbeddings(content);
    chat.embedding = embeddings;
    await chat.save();

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

export async function flowUpChat(req, res) {
  try {
    const { content } = req.body;
    const userId = req.user.id;
    const chatId = req.params.chatId;

    const message = await messageModel.create({
      chatroom: chatId,
      owner: userId,
      content: content,
      sender: "user",
    });

    const messages = await messageModel.find({ chatroom: chatId });
    const aiResponse = await generateResponse(messages);
    await messageModel.create({
      chatroom: chatId,
      owner: userId,
      content: aiResponse,
      sender: "bot",
    });

    const embeddings = await generateEmbeddings(messages);
    const chat = await chatModel.findById(chatId);
    chat.embedding = embeddings;
    await chat.save();

    res.status(201).json({
      message: "Chat updated successfully",
      success: true,
      aiResponse: aiResponse,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "[flowUpChat route]:-Error updating chat",
      success: false,
    });
  }
}

export async function getChat(req, res) {
  try {
    const chatId = req.params.chatId;
    const chat = await chatModel.findById(chatId).select("-embedding");
    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
        success: false,
      });
    }
    const messages = await messageModel.find({ chatroom: chatId });
    res.status(200).json({
      message: messages,
      chat: chat,
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "[getChat route]:-Error fetching chat",
      success: false,
    });
  }
}
