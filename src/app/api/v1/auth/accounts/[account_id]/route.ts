import { isRateLimited } from "@/src/lib/limiter";
import prisma from "@/src/lib/prisma";
import { verifyRole } from "@/src/lib/verifyRole";
import { NextRequest, NextResponse } from "next/server";


// Get single account
export async function GET(req: NextRequest, { params }: { params: Promise<{ account_id: string }> }) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Try again later." },
                { status: 429 }
            );
        }

        await verifyRole(["SUPERADMIN","ADMIN"]);

        const { account_id } = await params;
        if (!account_id || account_id.trim() === "") {
            return NextResponse.json({ error: "Invalid Account" }, { status: 400 });
        }

        const account = await prisma.account.findUnique({
            where: { id: account_id },
            select: {
                id: true,
                businessName: true,
                phone: true,
                location: true,
                email: true,
                createdAt: true,

                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        accountId: true,
                        createdAt: true,
                    }
                }
            }
        });

        if (!account) {
            return NextResponse.json(
                { error: "Account not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ account }, { status: 200 });

    } catch (err: any) {
        console.error(err.message);
        return NextResponse.json(
            { error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// Delete the account (only superadmin)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ account_id: string }> }) {
    try {

        const ip = req.headers.get("x-forwarded-for") || "unknown";
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Try again later." },
                { status: 429 }
            );
        }

        await verifyRole("SUPERADMIN");

        const { account_id } = await params;
        if (!account_id || account_id.trim() === "") {
            return NextResponse.json({ error: "Invalid Account" }, { status: 400 });
        }

        const isValidAccount = await prisma.account.findUnique({
            where: {
                id: account_id
            }
        })

        if (!isValidAccount) {
            return NextResponse.json({
                error: "Invalide Account"
            }, { status: 404 });
        };

        await prisma.account.delete({
            where: { id: account_id },
        });

        return NextResponse.json(
            {
                message: "Account deleted successfully. All related data removed.",
                deletedAccountId: account_id,
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.log(error.message);
        return NextResponse.json({
            error: error.message || "Something went wrong"
        }, { status: 500 })
    }
}