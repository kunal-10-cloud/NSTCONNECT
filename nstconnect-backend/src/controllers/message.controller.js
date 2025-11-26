const prisma = require("../utils/prisma");

exports.sendMessage = async (req, res) => {
    const { receiverId, content } = req.body;
    try {
        const message = await prisma.message.create({
            data: {
                senderId: req.userId,
                receiverId: parseInt(receiverId),
                content
            }
        });
        res.json(message);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getMessages = async (req, res) => {
    const { userId } = req.params; // The other user
    const otherId = parseInt(userId);
    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: req.userId, receiverId: otherId },
                    { senderId: otherId, receiverId: req.userId }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getConversations = async (req, res) => {
    // This is a complex query to get latest message per user.
    // For MVP, we can just get all friends and show if there are messages.
    // Or simpler: Get distinct users interacted with.
    try {
        const distinctReceiverIds = await prisma.message.findMany({
            where: { senderId: req.userId },
            distinct: ['receiverId'],
            select: { receiverId: true }
        });
        const distinctSenderIds = await prisma.message.findMany({
            where: { receiverId: req.userId },
            distinct: ['senderId'],
            select: { senderId: true }
        });

        const userIds = new Set([
            ...distinctReceiverIds.map(m => m.receiverId),
            ...distinctSenderIds.map(m => m.senderId)
        ]);

        const users = await prisma.user.findMany({
            where: { id: { in: Array.from(userIds) } },
            select: { id: true, name: true, profilePic: true }
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
