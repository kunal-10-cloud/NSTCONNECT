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
    const { name, department, bio, headline, skills, graduationYear, linkedinUrl, githubUrl } = req.body;
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
                githubUrl
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
        res.json(userWithoutPassword);
    } catch (error) {
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
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
