import { getAuth } from "@clerk/express";
import prisma from "../lib/connectDb.js";
import { getCurrentUser } from "../lib/getCurrentUser.js";

export const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const { category, author, search, isFeatured, sort } = req.query;

        const where = {};

        if (category) where.category = category;

        if (author) {
            const user = await prisma.user.findUnique({ where: { username: author } });
            if (!user) return res.status(404).json("User not found!");
            where.userId = user.id;
        }

        if (search) where.title = { contains: search, mode: "insensitive" };

        if (isFeatured) where.isFeatured = true;

        let orderBy = { createdAt: "desc" };

        if (sort) {
            switch (sort) {
                case "newest":  orderBy = { createdAt: "desc" }; break;
                case "oldest":  orderBy = { createdAt: "asc" };  break;
                case "popular": orderBy = { visit: "desc" };     break;
                case "trending":
                    orderBy = { visit: "desc" };
                    where.createdAt = {
                        gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
                    };
                    break;
            }
        }

        const posts = await prisma.post.findMany({
            where,
            orderBy,
            take: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
            include: { user: { select: { username: true } } },
        });

        const totalPosts = await prisma.post.count();
        const hasMore = page * limit < totalPosts;

        res.status(200).json({ posts, hasMore });

    } catch (error) {
        return res.status(500).json(error.message);
    }
}

export const getPost = async (req, res) => {
    try {
        const post = await prisma.post.findUnique({
            where: { slug: req.params.slug },
            include: { user: { select: { username: true, img: true } } },
        });
        if (!post) return res.status(404).json("Post not found!");
        res.status(200).json(post);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

export const createPost = async (req, res) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) return res.status(401).json("Not authenticated!");

        if (!req.body.title) return res.status(400).json("Title is required!");

        let slug = req.body.title.replace(/ /g, "-").toLowerCase();
        let existingPost = await prisma.post.findUnique({ where: { slug } });
        let counter = 2;
        while (existingPost) {
            slug = `${slug}-${counter}`;
            existingPost = await prisma.post.findUnique({ where: { slug } });
            counter++;
        }

        const body = req.body.desc ?? "";

        const post = await prisma.post.create({
            data: {
                title: req.body.title,
                desc: body,
                content: body,
                category: req.body.category || "general",
                img: req.body.img || null,
                slug,
                userId: user.id,
            },
        });

        res.status(201).json(post);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

export const deletePost = async (req, res) => {
    try {
        const { userId: clerkUserId, sessionClaims } = getAuth(req);
        if (!clerkUserId) return res.status(401).json("Not authenticated!");

        const postId = parseInt(req.params.id);
        if (!postId) return res.status(400).json("Post ID is required!");

        const role = sessionClaims?.metadata?.role || "user";
        const user = await prisma.user.findUnique({ where: { clerkUserId } });

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return res.status(404).json("Post not found!");

        if (role !== "admin" && post.userId !== user?.id) {
            return res.status(403).json("You can delete only your post!");
        }

        // Remove dependent comments first to satisfy the FK constraint.
        await prisma.$transaction([
            prisma.comment.deleteMany({ where: { postId } }),
            prisma.post.delete({ where: { id: postId } }),
        ]);

        res.status(200).json("Post deleted successfully!");
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

export const updatePost = async (req, res) => {
    try {
        const { userId: clerkUserId, sessionClaims } = getAuth(req);
        if (!clerkUserId) return res.status(401).json("Not authenticated!");

        const postId = parseInt(req.params.id);
        if (!postId) return res.status(400).json("Post ID is required!");

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return res.status(404).json("Post not found!");

        const role = sessionClaims?.metadata?.role || "user";
        const user = await prisma.user.findUnique({ where: { clerkUserId } });
        if (!user) return res.status(404).json("User not found!");

        if (role !== "admin" && post.userId !== user.id) {
            return res.status(403).json("You can edit only your post!");
        }

        const data = {};
        if (req.body.title !== undefined) data.title = req.body.title;
        if (req.body.category !== undefined) data.category = req.body.category || "general";
        if (req.body.img !== undefined) data.img = req.body.img || null;
        if (req.body.desc !== undefined) {
            data.desc = req.body.desc;
            data.content = req.body.desc;
        }

        const updated = await prisma.post.update({
            where: { id: postId },
            data,
        });

        res.status(200).json(updated);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

export const featurePost = async (req, res) => {
    try {
        const { userId: clerkUserId, sessionClaims } = getAuth(req);
        if (!clerkUserId) return res.status(401).json("Not authenticated!");

        const role = sessionClaims?.metadata?.role || "user";
        if (role !== "admin") return res.status(403).json("Only admins can feature posts!");

        const post = await prisma.post.findUnique({ where: { id: parseInt(req.body.postId) } });
        if (!post) return res.status(404).json("Post not found!");

        const updated = await prisma.post.update({
            where: { id: post.id },
            data: { isFeatured: !post.isFeatured },
        });

        res.status(200).json(updated);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

export const uploadAuth = async (req, res) => {
    res.status(501).json("Upload not configured!");
}
