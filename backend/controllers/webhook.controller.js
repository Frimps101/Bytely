import { Webhook } from "svix";
import prisma from "../lib/connectDb.js";

export const clerkWebHook = async (req, res) => {
    const webhook = new Webhook(process.env.WEBHOOK_SECRET);

    if (!webhook) return res.status(400).json("Invalid webhook!");

    const payload = req.body;
    const header = req.headers;

    let event;
    try {
        event = webhook.verify(payload, header);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message);
    }

    switch (event.type) {
        case "user.created": {
            await prisma.user.create({
                data: {
                    clerkUserId: event.data.id,
                    username: event.data.username || event.data.email_addresses[0].email_address,
                    email: event.data.email_addresses[0].email_address,
                    img: event.data.image_url,
                },
            });
            return res.status(200).json("User created successfully!");
        }
        case "user.updated": {
            await prisma.user.update({
                where: { clerkUserId: event.data.id },
                data: {
                    username: event.data.username || event.data.email_addresses[0].email_address,
                    email: event.data.email_addresses[0].email_address,
                    img: event.data.image_url,
                },
            });
            return res.status(200).json("User updated successfully!");
        }
        case "user.deleted": {
            const user = await prisma.user.findUnique({ where: { clerkUserId: event.data.id } });
            if (user) {
                await prisma.comment.deleteMany({ where: { userId: user.id } });
                await prisma.post.deleteMany({ where: { userId: user.id } });
                await prisma.user.delete({ where: { id: user.id } });
            }
            return res.status(200).json("User deleted successfully!");
        }
        default:
            return res.status(400).json("Invalid event type!");
    }
}
