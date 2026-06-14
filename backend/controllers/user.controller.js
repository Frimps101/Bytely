import prisma from "../lib/connectDb.js";
import { getCurrentUser } from "../lib/getCurrentUser.js";

export const getUserSavedPosts = async (req, res) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) return res.status(401).json("Not authenticated!");

        return res.status(200).json(user.savedPosts);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

export const getSavedPostsFull = async (req, res) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) return res.status(401).json("Not authenticated!");

        const ids = user.savedPosts
            .map((id) => Number(id))
            .filter((id) => !Number.isNaN(id));

        if (ids.length === 0) return res.status(200).json([]);

        const posts = await prisma.post.findMany({
            where: { id: { in: ids } },
            include: { user: { select: { username: true, img: true } } },
            orderBy: { createdAt: "desc" },
        });

        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

export const savePost = async (req, res) => {
    try {
        if (req.body.postId === undefined || req.body.postId === null) {
            return res.status(400).json("Post ID is required!");
        }
        const postId = String(req.body.postId);

        const user = await getCurrentUser(req);
        if (!user) {
            return res.status(401).json("Not authenticated!");
        }

        const savedPosts = user.savedPosts;
        const isPostSaved = savedPosts.includes(postId);

        const updatedSaved = isPostSaved
            ? savedPosts.filter((id) => id !== postId)
            : [...savedPosts, postId];

        await prisma.user.update({
            where: { id: user.id },
            data: { savedPosts: updatedSaved },
        });

        return res.status(200).json({
            saved: !isPostSaved,
            savedPosts: updatedSaved,
            message: isPostSaved ? "Post unsaved!" : "Post saved!",
        });
    } catch (error) {
        return res.status(500).json(error.message);
    }
}