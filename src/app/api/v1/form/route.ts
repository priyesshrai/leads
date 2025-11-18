import { NextResponse } from "next/server"
import { createFormSchema } from "@/src/types/form"
import slugify from "slugify"
import { isRateLimited } from "@/src/lib/limiter"
import { verifyRole } from "@/src/lib/verifyRole"
import prisma from "@/src/lib/prisma"


export async function GET(req: Request) {
    try {
        const user = await verifyRole(["ADMIN","SUPERADMIN"])
        const forms = await prisma.form.findMany({
            where: { userId: user.id },
            include: { fields: true },
            orderBy: { createdAt: "desc" },
        })
        return NextResponse.json({ forms })
    } catch (err: any) {
        console.error(err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

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
            select:{
                name:true,
                accountId:true
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
