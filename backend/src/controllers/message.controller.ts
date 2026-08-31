import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import prisma from "../lib/prisma";

export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { receiverId, content, listingId, bookingId } = req.body;
    const senderId = req.user!.id;

    if (!receiverId || !content || !content.trim()) {
      res.status(400).json({ error: "Receiver ID and message content are required." });
      return;
    }

    if (receiverId === senderId) {
      res.status(400).json({ error: "You cannot message yourself." });
      return;
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content: content.trim(),
        listingId: listingId || null,
        bookingId: bookingId || null,
      },
      include: {
        sender: {
          select: { id: true, name: true, collegeId: true, avatarUrl: true },
        },
        receiver: {
          select: { id: true, name: true, collegeId: true, avatarUrl: true },
        },
      },
    });

    // Notify receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "NEW_MESSAGE",
        title: `Message from ${req.user!.name}`,
        message: content.trim().length > 60 ? `${content.trim().substring(0, 60)}...` : content.trim(),
        link: `/dashboard/messages?user=${senderId}`,
      },
    });

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: { id: true, name: true, collegeId: true, college: true, avatarUrl: true },
        },
        receiver: {
          select: { id: true, name: true, collegeId: true, college: true, avatarUrl: true },
        },
        listing: {
          select: { id: true, title: true, images: true, dailyPrice: true },
        },
      },
    });

    // Group by peer user
    const conversationMap = new Map<string, any>();

    for (const msg of messages) {
      const isSender = msg.senderId === userId;
      const peer = isSender ? msg.receiver : msg.sender;
      if (!peer) continue;

      if (!conversationMap.has(peer.id)) {
        conversationMap.set(peer.id, {
          peer,
          lastMessage: msg,
          unreadCount: !isSender && !msg.read ? 1 : 0,
        });
      } else {
        if (!isSender && !msg.read) {
          const conv = conversationMap.get(peer.id);
          conv.unreadCount += 1;
        }
      }
    }

    const conversations = Array.from(conversationMap.values());
    res.json({ conversations });
  } catch (error) {
    next(error);
  }
};

export const getMessagesWithUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { peerId } = req.params;
    const userId = req.user!.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: peerId },
          { senderId: peerId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, collegeId: true, avatarUrl: true },
        },
        receiver: {
          select: { id: true, name: true, collegeId: true, avatarUrl: true },
        },
        listing: {
          select: { id: true, title: true, images: true, dailyPrice: true },
        },
      },
    });

    // Mark unread received messages as read
    await prisma.message.updateMany({
      where: {
        senderId: peerId,
        receiverId: userId,
        read: false,
      },
      data: { read: true },
    });

    res.json({ messages });
  } catch (error) {
    next(error);
  }
};
