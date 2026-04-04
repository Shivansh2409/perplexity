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

    res.status(201).json({
      message: "Chat created successfully",
      success: true,
      chatId: chat._id,
      title: title,
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

    // Validate if chatId is a valid MongoDB ObjectId
    if (!chatId || chatId === "undefined" || !/^[0-9a-f]{24}$/i.test(chatId)) {
      return res.status(400).json({
        message: "Invalid chat ID format",
        success: false,
      });
    }

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

// Unique Feature: Add Reaction to Message
export async function addReaction(req, res) {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    const message = await messageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({
        message: "Message not found",
        success: false,
      });
    }

    // Get or create reactions map
    if (!message.reactions) {
      message.reactions = new Map();
    }

    // Add user to emoji reactions
    if (!message.reactions.get(emoji)) {
      message.reactions.set(emoji, []);
    }

    const userIds = message.reactions.get(emoji);
    if (!userIds.includes(userId)) {
      userIds.push(userId);
      message.reactions.set(emoji, userIds);
    }

    await message.save();

    res.status(200).json({
      message: "Reaction added successfully",
      success: true,
      reactions: Object.fromEntries(message.reactions),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "[addReaction route]:-Error adding reaction",
      success: false,
    });
  }
}

// Unique Feature: Remove Reaction from Message
export async function removeReaction(req, res) {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    const message = await messageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({
        message: "Message not found",
        success: false,
      });
    }

    if (message.reactions && message.reactions.has(emoji)) {
      const userIds = message.reactions.get(emoji);
      const index = userIds.indexOf(userId);
      if (index > -1) {
        userIds.splice(index, 1);
        if (userIds.length === 0) {
          message.reactions.delete(emoji);
        } else {
          message.reactions.set(emoji, userIds);
        }
      }
    }

    await message.save();

    res.status(200).json({
      message: "Reaction removed successfully",
      success: true,
      reactions: message.reactions ? Object.fromEntries(message.reactions) : {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "[removeReaction route]:-Error removing reaction",
      success: false,
    });
  }
}

// Unique Feature: Pin Message
export async function pinMessage(req, res) {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await messageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({
        message: "Message not found",
        success: false,
      });
    }

    // Check if user is owner of the chat
    const chat = await chatModel.findById(message.chatroom);
    if (chat.createdBy.toString() !== userId) {
      return res.status(403).json({
        message: "Only chat owner can pin messages",
        success: false,
      });
    }

    message.isPinned = true;
    message.pinnedBy = userId;
    message.pinnedAt = new Date();
    await message.save();

    res.status(200).json({
      message: "Message pinned successfully",
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "[pinMessage route]:-Error pinning message",
      success: false,
    });
  }
}

// Unique Feature: Unpin Message
export async function unpinMessage(req, res) {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await messageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({
        message: "Message not found",
        success: false,
      });
    }

    // Check if user is owner of the chat
    const chat = await chatModel.findById(message.chatroom);
    if (chat.createdBy.toString() !== userId) {
      return res.status(403).json({
        message: "Only chat owner can unpin messages",
        success: false,
      });
    }

    message.isPinned = false;
    message.pinnedBy = null;
    message.pinnedAt = null;
    await message.save();

    res.status(200).json({
      message: "Message unpinned successfully",
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "[unpinMessage route]:-Error unpinning message",
      success: false,
    });
  }
}

// Unique Feature: Save Message
export async function saveMessage(req, res) {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await messageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({
        message: "Message not found",
        success: false,
      });
    }

    if (!message.savedBy.includes(userId)) {
      message.savedBy.push(userId);
    }

    await message.save();

    res.status(200).json({
      message: "Message saved successfully",
      success: true,
      savedBy: message.savedBy,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "[saveMessage route]:-Error saving message",
      success: false,
    });
  }
}

// Unique Feature: Unsave Message
export async function unsaveMessage(req, res) {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await messageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({
        message: "Message not found",
        success: false,
      });
    }

    const index = message.savedBy.indexOf(userId);
    if (index > -1) {
      message.savedBy.splice(index, 1);
    }

    await message.save();

    res.status(200).json({
      message: "Message unsaved successfully",
      success: true,
      savedBy: message.savedBy,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "[unsaveMessage route]:-Error unsaving message",
      success: false,
    });
  }
}

// Unique Feature: Edit Message
export async function editMessage(req, res) {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const message = await messageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({
        message: "Message not found",
        success: false,
      });
    }

    // Check if user is the message owner
    if (message.owner.toString() !== userId) {
      return res.status(403).json({
        message: "Only message owner can edit",
        success: false,
      });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    res.status(200).json({
      message: "Message edited successfully",
      success: true,
      updatedMessage: message,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "[editMessage route]:-Error editing message",
      success: false,
    });
  }
}

// Get Pinned Messages in Chat
export async function getPinnedMessages(req, res) {
  try {
    const { chatId } = req.params;

    const pinnedMessages = await messageModel
      .find({ chatroom: chatId, isPinned: true })
      .sort({ pinnedAt: -1 });

    res.status(200).json({
      message: "Pinned messages fetched successfully",
      success: true,
      pinnedMessages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "[getPinnedMessages route]:-Error fetching pinned messages",
      success: false,
    });
  }
}

// Get Saved Messages for User
export async function getSavedMessages(req, res) {
  try {
    const userId = req.user.id;

    const savedMessages = await messageModel.find({
      savedBy: userId,
    });

    res.status(200).json({
      message: "Saved messages fetched successfully",
      success: true,
      savedMessages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "[getSavedMessages route]:-Error fetching saved messages",
      success: false,
    });
  }
}
