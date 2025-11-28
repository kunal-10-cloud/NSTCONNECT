const prisma = require("../utils/prisma");

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'desc' }
        });

        // Enrich friend request notifications with sender info
        const enrichedNotifications = await Promise.all(
            notifications.map(async (notification) => {
                if (notification.type === 'FRIEND_REQUEST' && notification.referenceId) {
                    try {
                        const friendRequest = await prisma.friendRequest.findUnique({
                            where: { id: notification.referenceId },
                            include: {
                                sender: {
                                    select: {
                                        id: true,
                                        name: true,
                                        profilePic: true,
                                        headline: true
                                    }
                                }
                            }
                        });

                        if (friendRequest) {
                            return {
                                ...notification,
                                sender: friendRequest.sender,
                                friendRequestId: friendRequest.id
                            };
                        }
                    } catch (error) {
                        console.error('Error fetching friend request details:', error);
                    }
                }
                return notification;
            })
        );

        res.json(enrichedNotifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
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
