import prisma from "../lib/connectDb.js";

export const getPostComments = async (req, res) => {
    try {
        const comments = await prisma.comment.findMany({
            where: { postId: parseInt(req.params.postId) },
            include: { user: { select: { username: true, img: true } } },
            orderBy: { createdAt: "desc" },
        });

        res.status(200).json(comments);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

export const addComment = async (req, res) => {
    try {
        const clerkUserId = req.auth.userId;

        if (!clerkUserId) return res.status(401).json("Not authenticated!");

        const postId = parseInt(req.params.postId);
        if (!postId) return res.status(400).json("Post ID is required!");

        const user = await prisma.user.findUnique({ where: { clerkUserId } });
        if (!user) return res.status(404).json("User not found!");

        const comment = await prisma.comment.create({
            data: {
                desc: req.body.desc,
                userId: user.id,
                postId,
            },
        });

        res.status(201).json(comment);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

export const deleteComment = async (req, res) => {
    try {
        const clerkUserId = req.auth.userId;
        const commentId = parseInt(req.params.id);

        if (!clerkUserId) return res.status(401).json("Not authenticated!");
        if (!commentId) return res.status(400).json("Comment ID is required!");

        const role = req.auth.sessionClaims?.metadata?.role || "user";

        if (role === "admin") {
            await prisma.comment.delete({ where: { id: commentId } });
            return res.status(200).json("Comment deleted successfully!");
        }

        const user = await prisma.user.findUnique({ where: { clerkUserId } });
        const comment = await prisma.comment.findFirst({ where: { id: commentId, userId: user.id } });

        if (!comment) return res.status(403).json("You can delete only your comment!");

        await prisma.comment.delete({ where: { id: commentId } });
        res.status(200).json("Comment deleted successfully!");

    } catch (error) {
        return res.status(500).json(error.message);
    }
}

export const updateComment = async (req, res) => {
    try {
        const clerkUserId = req.auth.userId;
        const commentId = parseInt(req.params.id);

        if (!clerkUserId) return res.status(401).json("Not authenticated!");
        if (!commentId) return res.status(400).json("Comment ID is required!");

        const role = req.auth.sessionClaims?.metadata?.role || "user";

        if (role === "admin") {
            const updated = await prisma.comment.update({ where: { id: commentId }, data: req.body });
            return res.status(200).json(updated);
        }

        const user = await prisma.user.findUnique({ where: { clerkUserId } });
        const comment = await prisma.comment.findFirst({ where: { id: commentId, userId: user.id } });

        if (!comment) return res.status(403).json("You can update only your comment!");

        const updated = await prisma.comment.update({ where: { id: commentId }, data: { desc: req.body.desc } });
        res.status(200).json(updated);

    } catch (error) {
        return res.status(500).json(error.message);
    }
}
