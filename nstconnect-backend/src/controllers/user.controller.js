const prisma = require("../utils/prisma");

exports.getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: {
                _count: {
                    select: { friends: true, posts: true }
                }
            }
        });
        if (!user) return res.status(404).json({ error: "User not found" });

        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.updateProfile = async (req, res) => {
    const { name, department, bio, headline, skills, graduationYear, linkedinUrl, githubUrl, profilePic } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: req.userId },
            data: {
                name,
                department,
                bio,
                headline,
                skills,
                graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
                linkedinUrl,
                githubUrl,
                profilePic
            }
        });
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: { friends: true, posts: true }
                }
            }
        });
        if (!user) return res.status(404).json({ error: "User not found" });

        const { password, ...userWithoutPassword } = user;

        // Check friendship status with the requesting user
        let isFriend = false;
        let hasPendingRequest = false;
        let requestSentByMe = false;

        if (req.userId && req.userId !== parseInt(id)) {
            // Check if they are friends
            const friendship = await prisma.friend.findFirst({
                where: {
                    OR: [
                        { userId: req.userId, friendId: parseInt(id) },
                        { userId: parseInt(id), friendId: req.userId }
                    ]
                }
            });
            isFriend = !!friendship;

            // Check for pending friend requests
            if (!isFriend) {
                const pendingRequest = await prisma.friendRequest.findFirst({
                    where: {
                        OR: [
                            { senderId: req.userId, receiverId: parseInt(id), status: 'PENDING' },
                            { senderId: parseInt(id), receiverId: req.userId, status: 'PENDING' }
                        ]
                    }
                });

                if (pendingRequest) {
                    hasPendingRequest = true;
                    requestSentByMe = pendingRequest.senderId === req.userId;
                }
            }
        }

        res.json({
            ...userWithoutPassword,
            isFriend,
            hasPendingRequest,
            requestSentByMe
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.searchUsers = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: q } }, // Removed mode: 'insensitive' for MySQL compatibility if needed, but Prisma usually handles it. 
                    // Note: MySQL default collation is usually case-insensitive.
                    { department: { contains: q } }
                ]
            },
            take: 20,
            select: {
                id: true,
                name: true,
                department: true,
                profilePic: true,
                headline: true
            }
        });

        // Add friendship status for each user
        const usersWithStatus = await Promise.all(
            users.map(async (user) => {
                let isFriend = false;
                let hasPendingRequest = false;
                let requestSentByMe = false;

                if (req.userId && req.userId !== user.id) {
                    // Check if they are friends
                    const friendship = await prisma.friend.findFirst({
                        where: {
                            OR: [
                                { userId: req.userId, friendId: user.id },
                                { userId: user.id, friendId: req.userId }
                            ]
                        }
                    });
                    isFriend = !!friendship;

                    // Check for pending friend requests
                    if (!isFriend) {
                        const pendingRequest = await prisma.friendRequest.findFirst({
                            where: {
                                OR: [
                                    { senderId: req.userId, receiverId: user.id, status: 'PENDING' },
                                    { senderId: user.id, receiverId: req.userId, status: 'PENDING' }
                                ]
                            }
                        });

                        if (pendingRequest) {
                            hasPendingRequest = true;
                            requestSentByMe = pendingRequest.senderId === req.userId;
                        }
                    }
                }

                return {
                    ...user,
                    isFriend,
                    hasPendingRequest,
                    requestSentByMe
                };
            })
        );

        res.json(usersWithStatus);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};
