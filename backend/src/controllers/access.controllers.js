import AccessRequest from "../models/accessRequest.model.js";
import Chat from "../models/chats.model.js";
import { getIO } from "../sockets/server.soket.js";

export async function requestAccess(req, res) {
  try {
    const { chatId } = req.body;
    const requesterId = req.user._id;

    if (!chatId) {
      return res.status(400).json({ message: "chatId is required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const targetUserId = chat.createdBy;

    if (requesterId.equals(targetUserId)) {
      return res
        .status(400)
        .json({ message: "You already have access to this chat." });
    }

    if (chat.participants.includes(requesterId)) {
      return res
        .status(400)
        .json({ message: "You are already a participant in this chat." });
    }

    const existingRequest = await AccessRequest.findOne({
      requester: requesterId,
      chat: chatId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(409).json({ message: "Access request already sent." });
    }

    const accessRequest = await AccessRequest.create({
      requester: requesterId,
      targetUser: targetUserId,
      chat: chatId,
    });

    const io = getIO();
    io.to(targetUserId.toString()).emit("access_request_received", {
      ...accessRequest.toObject(),
      requester: { username: req.user.username },
    });

    res.status(201).json({
      message: "Access request sent successfully",
      success: true,
      request: accessRequest,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error requesting access" });
  }
}

export async function getPendingRequests(req, res) {
  try {
    const userId = req.user._id;
    const requests = await AccessRequest.find({
      targetUser: userId,
      status: "pending",
    })
      .populate("requester", "username email")
      .populate("chat", "title");

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching pending requests" });
  }
}

export async function updateRequestStatus(req, res) {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await AccessRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (!request.targetUser.equals(userId)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this request." });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Request has already been ${request.status}.` });
    }

    request.status = status;
    await request.save();

    const io = getIO();

    if (status === "approved") {
      const chat = await Chat.findById(request.chat);
      if (chat && !chat.participants.includes(request.requester)) {
        chat.participants.push(request.requester);
        // Set default permission to "view-only" when approved
        chat.permissions.set(request.requester.toString(), "view-only");
        await chat.save();
      }
      io.to(request.requester.toString()).emit("access_granted", {
        chatId: request.chat,
        title: chat.title,
        permission: "view-only",
      });
    } else {
      io.to(request.requester.toString()).emit("access_rejected", {
        chatId: request.chat,
      });
    }

    res.status(200).json({
      message: `Request ${status} successfully`,
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating request status" });
  }
}

export async function updateUserPermission(req, res) {
  try {
    const { chatId, userId } = req.params;
    const { permission } = req.body;
    const currentUserId = req.user._id;

    if (!["no-access", "view-only", "edit"].includes(permission)) {
      return res.status(400).json({ message: "Invalid permission level" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Only the chat owner can change permissions
    if (!chat.createdBy.equals(currentUserId)) {
      return res
        .status(403)
        .json({ message: "Only the chat owner can manage permissions" });
    }

    // Cannot change permission for the owner
    if (chat.createdBy.equals(userId)) {
      return res
        .status(400)
        .json({ message: "Cannot change permission for chat owner" });
    }

    chat.permissions.set(userId, permission);
    await chat.save();

    const io = getIO();
    io.to(userId).emit("permission_updated", {
      chatId: chatId,
      permission: permission,
    });

    res.status(200).json({
      message: "Permission updated successfully",
      success: true,
      permission: permission,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating permission" });
  }
}

export async function getUserPermission(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Owner has full edit access
    if (chat.createdBy.equals(userId)) {
      return res.status(200).json({
        success: true,
        permission: "edit",
        isOwner: true,
      });
    }

    const permission = chat.permissions.get(userId.toString()) || "no-access";

    res.status(200).json({
      success: true,
      permission: permission,
      isOwner: false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching permission" });
  }
}
