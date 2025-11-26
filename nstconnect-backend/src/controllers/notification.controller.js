const prisma = require("../utils/prisma");

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.markRead = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.notification.update({
            where: { id: parseInt(id) },
            data: { isRead: true }
        });
        res.json({ message: "Marked as read" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
