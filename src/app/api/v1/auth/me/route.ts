import { isRateLimited } from "@/src/lib/limiter";
import prisma from "@/src/lib/prisma";
import { verifyRole } from "@/src/lib/verifyRole";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Try again later." },
                { status: 429 }
            );
        }
        const user = await verifyRole(["SUPERADMIN", "ADMIN"]);
        const { searchParams } = new URL(req.url);
        const queryAccountId = searchParams.get("account_id")?.trim() || "";

        if (queryAccountId !== "") {
            const validAccount = await prisma.account.findUnique({
                where: { id: queryAccountId }
            });

            if (!validAccount) {
                return NextResponse.json(
                    { error: "Invalid Account." },
                    { status: 404 }
                );
            }
        }

        const account = await prisma.user.findUnique({
            where: { id: user.id },
            select: { accountId: true }
        });

        if (!account?.accountId && queryAccountId === "") {
            return NextResponse.json(
                { error: "Account not found." },
                { status: 404 }
            );
        }

        const finalAccountId = queryAccountId !== "" ? queryAccountId : account?.accountId;

        const user_account = await prisma.account.findUnique({
            where: {
                id: finalAccountId
            },
            include: {
                _count: {
                    select: {
                        forms: true,
                        users: true
                    }
                },
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    }
                },
            }
        });

        if (!user_account) {
            return NextResponse.json(
                { error: "Account not found." },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { user_account },
            { status: 200 }
        );

    } catch (err: any) {
        console.error(err.message);
        return NextResponse.json(
            { error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}

function generateNameInitials(name?: string | null): string {
    if (!name || !name.trim()) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    const first = parts[0].charAt(0).toUpperCase();
    const last = parts[parts.length - 1].charAt(0).toUpperCase();
    return first + last;
}