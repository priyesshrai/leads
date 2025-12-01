import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyResetJwt } from "@/src/lib/resetJwt";
import { resetPasswordSchema } from "@/src/types/auth";
import { isRateLimited } from "@/src/lib/limiter";

export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Try again later." },
                { status: 429 }
            );
        }
        const { token, password } = await req.json();
        const pass = resetPasswordSchema.safeParse({ password: password });
        if (!pass.success) {
            const flat = pass.error.flatten().fieldErrors;
            const firstError = Object.values(flat).flat()[0];

            return NextResponse.json(
                { error: firstError || "Invalid password" },
                { status: 400 }
            );
        }
        const payload = verifyResetJwt(token);
        if (!payload) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: payload.userId,
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.resetToken || user.resetToken !== token || !user.resetTokenExpiresAt || user.resetTokenExpiresAt <= new Date()) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }
        const cleanPassword = pass.data.password.trim()
        const hashedPassword = await bcrypt.hash(cleanPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiresAt: null
            }
        });

        return NextResponse.json({ message: "Password reset successful" }, { status: 201 });
    } catch (error) {
        console.log(error);
    }
}
