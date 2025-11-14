import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyResetJwt } from "@/src/lib/resetJwt";

export async function POST(req: Request) {
    const { token, password } = await req.json();

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

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiresAt: null
        }
    });

    return NextResponse.json({ message: "Password reset successful" }, { status: 201 });
}
