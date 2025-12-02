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
    businessStatus: string;
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
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = (await req.json()) as FollowUpPayload;

        if (!body.responseId) {
            return NextResponse.json({ error: "responseId is required" }, { status: 400 });
        }

        if (!body.businessStatus) {
            return NextResponse.json({ error: "businessStatus is required" }, { status: 400 });
        }

        const validBusinessStatuses = [
            "Client Converted",
            "Client will Call",
            "Client will Visit",
            "Client will Message",
            "Call Client",
            "Message Client",
            "Visit Client",
            "Put on Backburner",
            "Client not Interested",
        ];

        if (!validBusinessStatuses.includes(body.businessStatus)) {
            return NextResponse.json({ error: "Invalid business status" }, { status: 400 });
        }

        const parentResponse = await prisma.response.findUnique({
            where: { id: body.responseId },
            include: {
                followUps: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                }
            }
        });

        if (!parentResponse) {
            return NextResponse.json({ error: "Lead response not found" }, { status: 404 });
        }
        const lastFollowUp = parentResponse.followUps[0];
        const closedStatuses = ["Client Converted", "Client not Interested"];
        if (lastFollowUp && closedStatuses.includes(lastFollowUp.businessStatus)) {
            return NextResponse.json(
                {
                    error:
                        `This lead is already marked as "${lastFollowUp.businessStatus}". ` +
                        `No further follow-ups can be added.`,
                },
                { status: 400 }
            );
        }
        let internalStatus: FollowUpStatus = FollowUpStatus.PENDING;

        switch (body.businessStatus) {
            case "Client Converted":
                internalStatus = FollowUpStatus.COMPLETED;
                break;
            case "Client not Interested":
                internalStatus = FollowUpStatus.CANCELLED;
                break;
            case "Put on Backburner":
                internalStatus = FollowUpStatus.SKIPPED;
                break;
            default:
                internalStatus = FollowUpStatus.PENDING;
        }

        const nextDate = body.nextFollowUpDate
            ? new Date(body.nextFollowUpDate)
            : null;

        const followup = await prisma.followUp.create({
            data: {
                responseId: body.responseId,
                addedByUserId: user.id,
                type: body.type as FollowUpType,
                note: body.note ?? null,
                nextFollowUpDate: nextDate,
                businessStatus: body.businessStatus,
                status: internalStatus,
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
    } catch (err: any) {
        console.error("POST /followup error:", err);
        return NextResponse.json(
            { error: err.message || "Failed to create form" },
            { status: 500 }
        );
    }
}