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

export const savePost = async (req, res) => {
    try {
        const postId = req.body.postId;
        if (!postId) {
            return res.status(400).json("Post ID is required!");
        }

        const user = await getCurrentUser(req);
        if (!user) {
            return res.status(401).json("Not authenticated!");
        }

        const savedPosts = user.savedPosts;
        const isPostSaved = savedPosts.includes(postId);

        if (isPostSaved) {
            return res.status(400).json("Post already saved!");
        }

        savedPosts.push(postId);
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                savedPosts: savedPosts
            }
        })

        return res.status(200).json("Post saved successfully!");
    } catch (error) {
        return res.status(500).json(error.message);
    }
}