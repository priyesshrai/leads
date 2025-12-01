import { FollowUpStatus, FollowUpType } from "@/src/app/generated/prisma/enums";
import { isRateLimited } from "@/src/lib/limiter";
import prisma from "@/src/lib/prisma";
import { verifyRole } from "@/src/lib/verifyRole";
import { NextRequest, NextResponse } from "next/server";


interface FollowUpPayload {
    responseId: string;
    type: string;
    note?: string | null;
    nextFollowUpDate?: string | null;
    status?: string;
}

export async function POST(req: NextRequest) {
    try {

        const ip = req.headers.get("x-forwarded-for") || "unknown";
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Try again later." },
                { status: 429 }
            );
        }

        const user = await verifyRole(["ADMIN", "SUPERADMIN"]);
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const contentLength = Number(req.headers.get("content-length") || 0);
        if (contentLength > 50_000) {
            return NextResponse.json(
                { error: "Payload too large" },
                { status: 413 }
            );
        }

        const body = (await req.json()) as FollowUpPayload;

        if (!body.responseId) {
            return NextResponse.json(
                { error: "responseId is required" },
                { status: 400 }
            );
        }

        if (!body.type) {
            return NextResponse.json(
                { error: "type is required" },
                { status: 400 }
            );
        }

        const parentResponse = await prisma.response.findUnique({
            where: { id: body.responseId },
        });

        if (!parentResponse) {
            return NextResponse.json(
                { error: "Lead response not found" },
                { status: 404 }
            );
        }

        const nextDate = body.nextFollowUpDate
            ? new Date(body.nextFollowUpDate)
            : null;

        const status = body.status ?? "PENDING";

        const validStatuses = ["PENDING", "COMPLETED", "CANCELLED", "SKIPPED"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: "Invalid status value" },
                { status: 400 }
            );
        }

        const followup = await prisma.followUp.create({
            data: {
                responseId: body.responseId,
                addedByUserId: user.id,
                type: body.type as FollowUpType,
                note: body.note ?? null,
                nextFollowUpDate: nextDate,
                status: status as FollowUpStatus,
            },
            include: {
                addedBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        return NextResponse.json(
            { success: true, followup },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Follow-Up Create Error:", error.message);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
