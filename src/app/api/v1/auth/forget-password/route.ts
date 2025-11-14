import { NextResponse } from "next/server";
import { generateResetJwt } from "@/src/lib/resetJwt";
import { SendPasswordResetEmail } from "@/src/lib/sendPasswordResetEmail";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return NextResponse.json({ error: "Invalid email." }, { status: 404 });
    }
    const token = generateResetJwt(user.id);
    await prisma.user.update({
        where: { email },
        data: {
            resetToken: token,
            resetTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 15)
        }
    });
    const msg = await SendPasswordResetEmail(email, token);

    return NextResponse.json({ message: msg }, { status: 200 });
}
