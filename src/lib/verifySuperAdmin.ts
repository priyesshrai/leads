import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export interface AuthUser {
    id: string
    role: string
}

export async function verifySuperAdmin() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
        throw new Error("No authentication token found")
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser

        if (decoded.role !== "SUPERADMIN") {
            throw new Error("Unauthorized: Only SUPERADMIN access allowed")
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
