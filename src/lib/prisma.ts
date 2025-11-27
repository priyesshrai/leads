import "dotenv/config";
import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from '@/src/app/generated/prisma/client'

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

function createPrismaClient() {
    return new PrismaClient().$extends(withAccelerate());
}

export const prisma =
    globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}


export default prisma