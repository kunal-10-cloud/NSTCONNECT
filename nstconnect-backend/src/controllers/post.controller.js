const prisma = require("../utils/prisma");

exports.createPost = async (req, res) => {
    const { content, image } = req.body;
    try {
        const post = await prisma.post.create({
            data: {
                content,
                image,
                authorId: req.userId
            },
            include: { author: { select: { id: true, name: true, profilePic: true, headline: true } } }
        });
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getFeed = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    try {
        // Get posts from friends and self
        // For simplicity in this MVP, we might show all posts or just friend posts.
        // Let's show all posts for now to populate the feed easily.
        const posts = await prisma.post.findMany({
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { id: true, name: true, profilePic: true, headline: true } },
                _count: { select: { likes: true, comments: true } },
                likes: { where: { userId: req.userId }, select: { userId: true } } // Check if current user liked
            }
        });

        const formattedPosts = posts.map(post => ({
            ...post,
            isLiked: post.likes.length > 0
        }));

        res.json(formattedPosts);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.likePost = async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`[likePost] User ${req.userId} attempting to like post ${id}`);
        const existingLike = await prisma.like.findUnique({
            where: {
                postId_userId: {
                    postId: parseInt(id),
                    userId: req.userId
                }
            }
        });

        if (existingLike) {
            await prisma.like.delete({
                where: { id: existingLike.id }
            });
            console.log(`[likePost] User ${req.userId} unliked post ${id}`);
            return res.json({ message: "Unliked" });
        } else {
            await prisma.like.create({
                data: {
                    postId: parseInt(id),
                    userId: req.userId
                }
            });

            // Notify author if not self
            const post = await prisma.post.findUnique({ where: { id: parseInt(id) } });
            if (post.authorId !== req.userId) {
                await prisma.notification.create({
                    data: {
                        userId: post.authorId,
                        type: 'LIKE',
                        referenceId: post.id,
                        message: 'Someone liked your post'
                    }
                });
            }

            console.log(`[likePost] User ${req.userId} liked post ${id}`);
            return res.json({ message: "Liked" });
        }
    } catch (error) {
        console.error('[likePost] Error:', {
            postId: id,
            userId: req.userId,
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

exports.commentPost = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    try {
        console.log(`[commentPost] User ${req.userId} commenting on post ${id}`);
        const comment = await prisma.comment.create({
            data: {
                content,
                postId: parseInt(id),
                authorId: req.userId
            },
            include: { author: { select: { id: true, name: true, profilePic: true } } }
        });

        // Notify author
        const post = await prisma.post.findUnique({ where: { id: parseInt(id) } });
        if (post.authorId !== req.userId) {
            await prisma.notification.create({
                data: {
                    userId: post.authorId,
                    type: 'COMMENT',
                    referenceId: post.id,
                    message: 'Someone commented on your post'
                }
            });
        }

        console.log(`[commentPost] Comment created successfully on post ${id}`);
        res.json(comment);
    } catch (error) {
        console.error('[commentPost] Error:', {
            postId: id,
            userId: req.userId,
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

exports.getComments = async (req, res) => {
    const { id } = req.params;
    try {
        const comments = await prisma.comment.findMany({
            where: { postId: parseInt(id) },
            include: { author: { select: { id: true, name: true, profilePic: true } } },
            orderBy: { createdAt: 'asc' }
        });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
