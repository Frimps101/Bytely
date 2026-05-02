import prisma from "../lib/connectDb.js";

const increaseVisit = async (req, res, next) => {
    try {
        const slug = req.params.slug;

        await prisma.post.update({
            where: { slug },
            data: { visit: { increment: 1 } },
        });

        next();
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

export default increaseVisit;
