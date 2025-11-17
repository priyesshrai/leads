import prisma from "@/src/lib/prisma";
import { verifyRole } from "@/src/lib/verifyRole";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const user = await verifyRole(["SUPERADMIN", "ADMIN"]);
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }
        const dbUser = await prisma.user.findFirst({
            where: { email: user.email },
            select: {
                id: true,
                name: true,
                email: true,
                account: true,
                accountId: true,
            },
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const initials = generateNameInitials(dbUser.name);
        const responsePayload = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            accountId: dbUser.accountId,
            account: dbUser.account,
            initials,
        };

        return NextResponse.json(responsePayload, { status: 200 });

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