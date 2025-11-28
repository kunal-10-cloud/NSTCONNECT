const prisma = require("../utils/prisma");

exports.sendRequest = async (req, res) => {
    const { receiverId } = req.params;
    const receiverIdInt = parseInt(receiverId);

    if (req.userId === receiverIdInt) {
        return res.status(400).json({ error: 'Cannot send request to yourself' });
    }

    try {
        const existing = await prisma.friendRequest.findFirst({
            where: {
                senderId: req.userId,
                receiverId: receiverIdInt,
                status: 'PENDING'
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Request already sent' });
        }

        // Check if already friends
        const alreadyFriends = await prisma.friend.findFirst({
            where: { userId: req.userId, friendId: receiverIdInt }
        });
        if (alreadyFriends) {
            return res.status(400).json({ error: 'Already friends' });
        }

        const request = await prisma.friendRequest.create({
            data: {
                senderId: req.userId,
                receiverId: receiverIdInt
            }
        });

        try {
            await prisma.notification.create({
                data: {
                    userId: receiverIdInt,
                    type: 'FRIEND_REQUEST',
                    referenceId: request.id,
                    message: 'You have a new connection request'
                }
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
            // Continue execution even if notification fails
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.acceptRequest = async (req, res) => {
    const { requestId } = req.params;
    try {
        const request = await prisma.friendRequest.findUnique({
            where: { id: parseInt(requestId) }
        });

        if (!request || request.receiverId !== req.userId) {
            return res.status(400).json({ error: 'Invalid request' });
        }
        if (request.status !== 'PENDING') {
            return res.status(400).json({ error: 'Request already processed' });
        }

        // Check if friendship already exists
        const existingFriendship = await prisma.friend.findFirst({
            where: {
                OR: [
                    { userId: request.senderId, friendId: request.receiverId },
                    { userId: request.receiverId, friendId: request.senderId }
                ]
            }
        });

        if (existingFriendship) {
            // Just update the request status, friendship already exists
            await prisma.friendRequest.update({
                where: { id: request.id },
                data: { status: 'ACCEPTED' }
            });
            return res.json({ message: 'Friend request accepted' });
        }

        await prisma.$transaction([
            prisma.friendRequest.update({
                where: { id: request.id },
                data: { status: 'ACCEPTED' }
            }),
            prisma.friend.createMany({
                data: [
                    { userId: request.senderId, friendId: request.receiverId },
                    { userId: request.receiverId, friendId: request.senderId }
                ]
            }),
            prisma.notification.create({
                data: {
                    userId: request.senderId,
                    type: 'FRIEND_ACCEPTED',
                    referenceId: request.receiverId,
                    message: 'Your connection request was accepted'
                }
            })
        ]);

        res.json({ message: 'Friend request accepted' });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.rejectRequest = async (req, res) => {
    const { requestId } = req.params;
    try {
        const request = await prisma.friendRequest.findUnique({
            where: { id: parseInt(requestId) }
        });

        if (!request || request.receiverId !== req.userId) {
            return res.status(400).json({ error: 'Invalid request' });
        }
        if (request.status !== 'PENDING') {
            return res.status(400).json({ error: 'Request already processed' });
        }

        await prisma.friendRequest.update({
            where: { id: request.id },
            data: { status: 'REJECTED' }
        });

        res.json({ message: 'Friend request rejected' });
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getFriends = async (req, res) => {
    try {
        const friends = await prisma.friend.findMany({
            where: { userId: req.userId },
            include: { friend: { select: { id: true, name: true, profilePic: true, headline: true, department: true } } }
        });
        res.json(friends.map(f => f.friend));
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getRequests = async (req, res) => {
    try {
        const requests = await prisma.friendRequest.findMany({
            where: { receiverId: req.userId, status: 'PENDING' },
            include: { sender: { select: { id: true, name: true, profilePic: true, headline: true } } }
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
