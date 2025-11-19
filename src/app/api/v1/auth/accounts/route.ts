import { isRateLimited } from "@/src/lib/limiter";
import prisma from "@/src/lib/prisma";
import { verifyRole } from "@/src/lib/verifyRole";
import { NextRequest, NextResponse } from "next/server";


// Get all the account (only superadmin).
export async function GET(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Try again later." },
                { status: 429 }
            );
        }

        await verifyRole("SUPERADMIN");

        const { searchParams } = new URL(req.url);
        const page = Math.max(Number(searchParams.get("page")) || 1, 1);
        const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 10, 1), 50);
        const skip = (page - 1) * limit;

        const users = await prisma.account.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        });

        const totalUsers = await prisma.user.count();

        if (users.length === 0) {
            return NextResponse.json(
                { message: "No users found. Please create one now." },
                { status: 200 }
            );
        }
        const pageCount = Math.ceil(totalUsers / limit);
        const response = {
            users,
            page,
            limit,
            totalUsers,
            pageCount,
            hasMore: page < pageCount,
            nextPage: page < pageCount ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        };
        return NextResponse.json(
            response,
            { status: 200 }
        );
    } catch (error: any) {
        console.error("GET /users error:", error.message);

        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}