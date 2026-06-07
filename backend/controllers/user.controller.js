import prisma from "../lib/connectDb.js";

export const getUserSavedPosts = async (req, res) => {
    const clerkUserId = req.auth.userId;

    if (!clerkUserId) {
        return res.status(401).json("Not authenticated!");
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                clerkUserId: clerkUserId
            }
        })

        return res.status(200).json(user.savedPosts);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

export const savePost = async (req, res) => {
    try {
        const clerkUserId = req.auth.userId;
        const postId = req.body.postId;

        if (!clerkUserId) {
            return res.status(401).json("Not authenticated!");
        }

        if (!postId) {
            return res.status(400).json("Post ID is required!");
        }

        const user = await prisma.user.findUnique({
            where: {
                clerkUserId: clerkUserId
            }
        })
        
        if (!user) {
            return res.status(404).json("User not found!");
        }

        const savedPosts = user.savedPosts;
        const isPostSaved = savedPosts.includes(postId);

        if (isPostSaved) {
            return res.status(400).json("Post already saved!");
        }

        savedPosts.push(postId);
        await prisma.user.update({
            where: {
                clerkUserId: clerkUserId
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