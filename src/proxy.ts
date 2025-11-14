import { NextResponse, NextRequest } from "next/server"
import { verifyToken } from "./lib/auth";

const protectedRoutes = ["/dashboard", "/admin", "/profile"];

const publicRoutes = ["/login", "/reset-password", "/forget-password"]

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get("token")?.value || null;

    if (!token) {
        if (protectedRoutes.some(route => pathname.startsWith(route))) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
        return NextResponse.next();
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        const response = NextResponse.redirect(new URL("/login", req.url));
        response.cookies.delete("token");
        return response;
    }

    if (publicRoutes.some(route => pathname.startsWith(route))) {
        if (decoded.role === "ADMIN" || decoded.role === "SUPERADMIN") {
            return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/login",
        "/register",
        "/forget-password",
        "/reset-password",
        "/admin/:path*",
        "/profile/:path*",
        "/superadmin/:path*",
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
}
