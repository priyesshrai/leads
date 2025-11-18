import { isRateLimited } from "@/src/lib/limiter";
import prisma from "@/src/lib/prisma";
import { verifyRole } from "@/src/lib/verifyRole";
import { updateFormSchema } from "@/src/types/form";
import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";


export async function GET(req: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Try again later." },
                { status: 429 }
            );
        }
        const user = await verifyRole(["ADMIN", "SUPERADMIN"])
        const { formId } = await params

        if (!formId || formId.trim() === "") {
            return NextResponse.json({ error: "Invalid form ID" }, { status: 400 })
        }

        const form = await prisma.form.findFirst({
            where: { id: formId, userId: user.id },
            include: { fields: true },
        })
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 })

        return NextResponse.json({ form })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Error fetching form" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
    try {
        const user = await verifyRole(["ADMIN","SUPERADMIN"])
        const { formId } = await params

        if (!formId || formId.trim() === "") {
            return NextResponse.json({ error: "Invalid form ID" }, { status: 400 })
        }

        const form = await prisma.form.findFirst({
            where: { id: formId, userId: user.id },
        })
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 })

        await prisma.$transaction([
            prisma.formField.deleteMany({ where: { formId: form.id } }),
            prisma.form.delete({ where: { id: form.id } }),
        ])
        return NextResponse.json({ success: true })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Error deleting form" }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
    try {
        const user = await verifyRole(["ADMIN","SUPERADMIN"])
        const contentLength = Number(req.headers.get("content-length") || 0)
        if (contentLength > 50_000) {
            return NextResponse.json({ error: "Payload too large" }, { status: 413 })
        }

        const { formId } = await params
        if (!formId || formId.trim() === "") {
            return NextResponse.json({ error: "Invalid form ID" }, { status: 400 })
        }

        const form = await prisma.form.findFirst({
            where: { id: formId, userId: user.id },
            include: { fields: true },
        })
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 })

        const body = await req.json()
        const parsed = updateFormSchema.safeParse(body)
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

        const updatedForm = await prisma.$transaction(async (tx) => {

            const newForm = await tx.form.update({
                where: { id: form.id },
                data: {
                    title: cleanTitle,
                    description: cleanDescription,
                    slug,
                },
            })

            const existingIds = form.fields.map((f) => f.id)
            const incomingIds = fields?.map((f: any) => f.id).filter(Boolean) || []

            const toDelete = existingIds.filter((id) => !incomingIds.includes(id))
            if (toDelete.length > 0) {
                await tx.formField.deleteMany({ where: { id: { in: toDelete } } })
            }

            for (const [index, f] of (fields || []).entries()) {
                const cleanLabel = f.label.trim()

                if (f.id) {
                    await tx.formField.update({
                        where: { id: f.id },
                        data: {
                            label: cleanLabel,
                            type: f.type,
                            required: f.required ?? false,
                            options: f.options ? JSON.stringify(f.options) : undefined,
                            order: f.order ?? index + 1,
                        },
                    })
                } else {
                    await tx.formField.create({
                        data: {
                            formId: form.id,
                            label: cleanLabel,
                            type: f.type,
                            required: f.required ?? false,
                            options: f.options ? JSON.stringify(f.options) : undefined,
                            order: f.order ?? index + 1,
                        },
                    })
                }
            }

            const result = await tx.form.findUnique({
                where: { id: form.id },
                include: { fields: true },
            })

            return result
        })

        return NextResponse.json({ success: true, form: updatedForm }, { status: 200 })

    } catch (err) {
        console.error("PATCH /forms/:id error:", err)
        return NextResponse.json({ error: "Failed to update form" }, { status: 500 })
    }
}