import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { verifyRole } from "@/src/lib/verifyRole";
import { isRateLimited } from "@/src/lib/limiter";

export async function GET(req: NextRequest, { params }: { params: Promise<{ responseId: string }> }) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Try again later." },
                { status: 429 }
            );
        }

        await verifyRole(["ADMIN", "SUPERADMIN"])
        const { responseId } = await params;

        const response = await prisma.response.findUnique({
            where: { id: responseId },
            include: {
                form: {
                    include: { fields: true }
                },
                answers: true,
            },
        });

        if (!response) {
            return NextResponse.json({ error: "Response not found" }, { status: 404 });
        }

        const formatted: Record<string, any> = {};

        for (const ans of response.answers) {
            const field = response.form.fields.find(f => f.id === ans.fieldId);
            let value = ans.value;

            if (value.startsWith("[") && value.endsWith("]")) {
                try { value = JSON.parse(value); } catch { }
            }

            formatted[field?.label || ans.fieldId] = value;
        }

        return NextResponse.json({
            responseId: response.id,
            submittedAt: response.submittedAt,
            answers: formatted,
        });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json(
            { error: err.message || "Failed to fetch response" },
            { status: 500 }
        );
    }
}
