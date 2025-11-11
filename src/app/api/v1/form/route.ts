import { NextResponse } from "next/server"
import { PrismaClient } from "@/src/app/generated/prisma/client"
import { createFormSchema } from "@/src/types/form"
import { VerifyAdmin } from "@/src/lib/auth"
import slugify from "slugify"


const prisma = new PrismaClient()

export async function GET(req: Request) {
    try {
        const user = await VerifyAdmin()
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
        const user = await VerifyAdmin()

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

        const result = await prisma.$transaction(async (tx) => {
            const newForm = await tx.form.create({
                data: {
                    title: cleanTitle,
                    description: cleanDescription,
                    slug,
                    userId: user.id,
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
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Failed to create form" }, { status: 500 })
    }
}
