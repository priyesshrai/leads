import { login } from "@/src/lib/auth"
import { isRateLimited } from "@/src/lib/limiter"
import { loginSchema } from "@/src/types/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown"
        if (isRateLimited(ip)) {
            return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 })
        }

        const body = await req.json()
        const parsed = loginSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
        }

        const { email, password } = parsed.data
        const { token, user } = await login(email, password)

        const res = NextResponse.json({ success: true, user })
        res.cookies.set("token", token, { httpOnly: true, secure: true, path: "/", maxAge: 86400 })
        return res
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Invalid credentials" }, { status: 401 })
    }
}
