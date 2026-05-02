import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const connectDb = async () => {
    try {
        await prisma.$connect();
        console.log("Database connected!");
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};

export default prisma;
