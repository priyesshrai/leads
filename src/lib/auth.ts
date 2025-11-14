import jwt from 'jsonwebtoken'
import prisma from "./prisma"
import bcrypt from "bcryptjs"
import { cookies } from 'next/headers'
import { AuthUser } from './verifySuperAdmin'

const JWT_SECRET = process.env.JWT_SECRET!

export async function login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return "User not found";

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return "Invalid password";

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, {
        expiresIn: "1d",
    })
    return { token, user }
}
export interface DecodedUser {
    id: string;
    role: "ADMIN" | "SUPERADMIN";
    email: string
}

export function verifyToken(token: string): DecodedUser | null {
    try {
        return jwt.verify(token, JWT_SECRET) as DecodedUser
    } catch {
        throw new Error("Invalid token")
    }
}


export async function VerifyAdmin() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
        throw new Error("No authentication token found")
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser

        if (decoded.role !== "ADMIN") {
            throw new Error("Unauthorized: Only ADMIN access allowed")
        }

        return decoded
    } catch (err: any) {
        if (err.name === "TokenExpiredError") {
            throw new Error("Session expired. Please log in again.")
        }
        if (err.name === "JsonWebTokenError") {
            throw new Error("Invalid token. Authentication failed.")
        }
        throw new Error("Authentication error")
    }
}