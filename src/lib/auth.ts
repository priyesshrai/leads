import jwt from 'jsonwebtoken'
import prisma from "./prisma"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET!

export async function login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error("User not found")

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new Error("Invalid password")

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "1d",
    })
    return { token, user }
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET)
    } catch {
        throw new Error("Invalid token")
    }
}
