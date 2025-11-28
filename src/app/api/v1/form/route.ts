import { NextResponse } from "next/server"
import { createFormSchema } from "@/src/types/form"
import slugify from "slugify"
import { isRateLimited } from "@/src/lib/limiter"
import { verifyRole } from "@/src/lib/verifyRole"
import prisma from "@/src/lib/prisma"

// get all form associted with user only
export async function GET(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Try again later." },
                { status: 429 }
            );
        }

        const user = await verifyRole(["ADMIN", "SUPERADMIN"])
        const { searchParams } = new URL(req.url);
        const page = Math.max(Number(searchParams.get("page")) || 1, 1);
        const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 10, 1), 50);
        const skip = (page - 1) * limit;
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

        const forms = await prisma.form.findMany({
            where: { accountId: finalAccountId },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: { fields: true },
        });

        const totalForm = await prisma.form.count({
            where: { accountId: finalAccountId }
        });

        if (forms.length === 0) {
            return NextResponse.json(
                { message: "No forms found. Please create one now." },
                { status: 200 }
            );
        }
        const pageCount = Math.ceil(totalForm / limit);
        const response = {
            forms,
            page,
            limit,
            totalForm,
            pageCount,
            hasMore: page < pageCount,
            nextPage: page < pageCount ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        };
        return NextResponse.json({ response }, { status: 200 })
    } catch (err: any) {
        console.error(err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// create form 
export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Try again later." },
                { status: 429 }
            );
        }

        const user = await verifyRole(["SUPERADMIN", "ADMIN"]);

        const contentLength = Number(req.headers.get("content-length") || 0)
        if (contentLength > 50_000) {
            return NextResponse.json({ error: "Payload too large" }, { status: 413 })
        }

        const body = await req.json()

        const parsed = createFormSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            )
        }
        const { title, description, fields } = parsed.data

        const cleanTitle = title.trim()
        const cleanDescription = description?.trim() || ""

        const slugBase = slugify(cleanTitle, { lower: true, strict: true })
        const slug = `${slugBase}-${Date.now()}`

        const existing = await prisma.form.findFirst({
            where: { userId: user.id, title: cleanTitle },
        })

        if (existing) {
            return NextResponse.json(
                { error: "A form with this title already exists" },
                { status: 400 }
            )
        }
        const formOwner = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                name: true,
                accountId: true
            }
        })
        const formCount = await prisma.form.count({
            where: { userId: user.id },
        })

        const prefix = formOwner?.name.slice(0, 4).toUpperCase()
        const formattedCount = String(formCount + 1).padStart(4, "0")
        const datePart = new Date().toISOString()
        const uniqueId = `${prefix}-${formattedCount}-${datePart}`

        const result = await prisma.$transaction(async (tx) => {
            const newForm = await tx.form.create({
                data: {
                    title: cleanTitle,
                    description: cleanDescription,
                    formsId: uniqueId,
                    slug,
                    userId: user.id,
                    accountId: formOwner?.accountId,
                    fields: {
                        create: fields?.map((f, idx) => ({
                            label: f.label.trim(),
                            type: f.type,
                            required: f.required ?? false,
                            options: f.options ? JSON.stringify(f.options) : undefined,
                            order: f.order ?? idx + 1,
                        })) || [],
                    },
                },
                include: { fields: true },
            })

            return newForm
        })

        return NextResponse.json({ success: true, form: result }, { status: 201 })
    } catch (err: any) {
        console.error(err.message)
        return NextResponse.json({ error: err.message || "Failed to create form" }, { status: 500 })
    }
}
