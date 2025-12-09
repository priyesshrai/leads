"use server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface DecodedUser {
    id: string;
    role: "ADMIN" | "SUPERADMIN";
    email: string
}
export async function verifyRole(allowedRoles: string[] | string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        throw new Error("No authentication token found");
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser;

        const rolesArray = Array.isArray(allowedRoles)
            ? allowedRoles
            : [allowedRoles];

        if (!rolesArray.includes(decoded.role)) {
            throw new Error(`Unauthorized: Allowed roles are ${rolesArray.join(", ")}`);
        }

        const user = await prisma.user.findUnique({
            where: { email: decoded.email },
        });

        if (!user) {
            throw new Error("User not found");
        }

        return decoded;
    } catch (err: any) {
        if (err.name === "TokenExpiredError") {
            throw new Error("Session expired. Please log in again.");
        }

        if (err.name === "JsonWebTokenError") {
            throw new Error("Invalid token. Authentication failed.");
        }

        throw new Error("Authentication error");
    }
}
