import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/src/lib/limiter";
import prisma from "@/src/lib/prisma";
import { verifyRole } from "@/src/lib/verifyRole";

export const runtime = "nodejs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const MAX_FILE_SIZE = Number(20 * 1024 * 1024);
const ALLOWED_MIME = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

async function uploadToCloudinaryBuffer(buffer: Buffer, fieldId: string) {
    return new Promise<{ url: string; public_id: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: `forms/${fieldId}`, resource_type: "auto" },
            (err, result) => {
                if (err || !result) reject(err);
                else resolve({
                    url: result.secure_url,
                    public_id: result.public_id,
                });
            }
        ).end(buffer);
    });
}

// Saving form data in DB(any one).
export async function POST(req: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
    const fileMap: Record<string, File[]> = {};
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Try again later." },
                { status: 429 }
            );
        }

        const { formId } = await params;

        if (!formId || formId.trim() === "") {
            return NextResponse.json({ error: "Invalid form ID" }, { status: 400 });
        }

        const form = await prisma.form.findFirst({
            where: { id: formId },
            include: { fields: true },
        });

        if (!form) {
            return NextResponse.json({ error: "Form not found" }, { status: 404 });
        }

        const formData = await req.formData();

        const incoming: Record<string, any> = {};

        for (const ff of form.fields) {
            const values = formData.getAll(ff.id);

            const files: File[] = values.filter((v) => v instanceof File) as File[];
            const texts: string[] = values.filter((v) => typeof v === "string") as string[];

            if (texts.length === 1) incoming[ff.id] = texts[0];
            else if (texts.length > 1) incoming[ff.id] = texts;

            if (files.length > 0) fileMap[ff.id] = files;
        }

        for (const ff of form.fields) {
            const simple = incoming[ff.id];
            const file = fileMap[ff.id];

            if (ff.required && !simple && (!file || file.length === 0)) {
                return NextResponse.json(
                    { error: `Field "${ff.label}" is required` },
                    { status: 400 }
                );
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            const response = await tx.response.create({
                data: { formId: form.id },
            });
            for (const ff of form.fields) {
                const simpleValue = incoming[ff.id];
                const fileList = fileMap[ff.id];

                if (fileList && fileList.length > 0) {
                    const urls: string[] = [];

                    for (const file of fileList) {
                        if (!ALLOWED_MIME.includes(file.type)) {
                            throw new Error(`File type ${file.type} not allowed`);
                        }
                        if (file.size > MAX_FILE_SIZE) {
                            throw new Error(`File ${file.name} exceeds 20MB limit`);
                        }

                        const buffer = Buffer.from(await file.arrayBuffer());
                        const uploaded = await uploadToCloudinaryBuffer(buffer, ff.id);
                        urls.push(uploaded.url);
                    }

                    await tx.responseAnswer.create({
                        data: {
                            responseId: response.id,
                            fieldId: ff.id,
                            value: urls.length === 1 ? urls[0] : JSON.stringify(urls),
                        },
                    });

                    continue;
                }
                const finalVal = simpleValue
                    ? Array.isArray(simpleValue)
                        ? JSON.stringify(simpleValue)
                        : String(simpleValue)
                    : "";

                await tx.responseAnswer.create({
                    data: {
                        responseId: response.id,
                        fieldId: ff.id,
                        value: finalVal,
                    },
                });
            }

            return response;
        });

        return NextResponse.json(
            { success: true, responseId: result.id },
            { status: 201 }
        );
    } catch (err: any) {
        console.error("Submit error:", err);
        return NextResponse.json(
            { error: err.message || "Submission failed" },
            { status: 500 }
        );
    }
}

// Getting all the response for the single form provided according to form id(Only admin and superadmin).
export async function GET(req: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Try again later." },
                { status: 429 }
            );
        }

        await verifyRole(["ADMIN", "SUPERADMIN"])
        const { searchParams } = new URL(req.url);
        const page = Math.max(Number(searchParams.get("page")) || 1, 1);
        const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 20, 1), 50);
        const skip = (page - 1) * limit;
        const { formId } = await params;

        const form = await prisma.form.findUnique({
            where: { id: formId },
            include: {
                fields: true,
                responses: {
                    skip,
                    take: limit,
                    orderBy: { submittedAt: "desc" },
                    include: {
                        answers: true,
                    },
                },
            },
        });

        if (!form) {
            return NextResponse.json({ error: "Form not found" }, { status: 404 });
        }

        const responseCount = await prisma.response.count({
            where: {
                formId: formId
            }
        })

        if (responseCount === 0) {
            return NextResponse.json(
                { message: "No response found." },
                { status: 404 }
            );
        }

        const formatted = form.responses.map((res) => {
            const answerMap: Record<string, any> = {};

            for (const ans of res.answers) {
                const field = form.fields.find((f) => f.id === ans.fieldId);

                let value = ans.value;

                if (value && value.startsWith("[") && value.endsWith("]")) {
                    try {
                        value = JSON.parse(value);
                    } catch {
                        console.log("error");
                    }
                }

                answerMap[field?.label || ans.fieldId] = value;
            }

            return {
                responseId: res.id,
                submittedAt: res.submittedAt,
                answers: answerMap,
            };
        });


        const pageCount = Math.ceil(responseCount / limit);

        const res = {
            id: form.id,
            formId: form.formsId,
            title: form.title,
            description: form.description,
            responses: formatted,
            page,
            limit,
            responseCount,
            pageCount,
            hasMore: page < pageCount,
            nextPage: page < pageCount ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        }
        return NextResponse.json(res, { status: 200 });
    } catch (error: any) {
        console.error("Retrieve error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch responses" },
            { status: 500 }
        );
    }
}
