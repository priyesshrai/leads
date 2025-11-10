import { PrismaClient } from "@/src/app/generated/prisma/client"
import { isRateLimited } from "@/src/lib/limiter"
import { verifySuperAdmin } from "@/src/lib/verifySuperAdmin"
import { userSchema } from "@/src/types/auth"
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown"
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many login attempts. Try again later." },
                { status: 429 }
            )
        }

        const user = await verifySuperAdmin()

        const ct = req.headers.get('content-type') || ''
        let body: any
        if (ct.includes('application/json')) {
            body = await req.json()
        } else if (ct.includes('form')) {
            const form = await req.formData()
            body = { email: form.get('email'), password: form.get('password') }
        } else {
            return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 })
        }

        const parsed = userSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
        }

        const email = parsed.data.email.toLowerCase().trim()
        const password = parsed.data.password.trim()

        const existing = await prisma.user.findUnique({
            where: { email: email },
        })

        if (existing) {
            return NextResponse.json({ error: "Email already exists" }, { status: 409 })
        }
        const hashed = await bcrypt.hash(password, 10)

        const newAdmin = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email.toLowerCase(),
                password: hashed,
                role: "ADMIN",
                createdById: user.id,
            },
        })
        if (!newAdmin) {
            return NextResponse.json({ error: "Can't create the user" }, { status: 500 });
        }
        return NextResponse.json({ success: true, message: 'User Created successfully' }, { status: 201 })

    } catch (err: any) {
        console.error("Login error:", err)
        return NextResponse.json({ error: err.message || "Invalid credentials" }, { status: 401 })
    }
}