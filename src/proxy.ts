import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

const PUBLIC_ROUTES = [
    "/login",
    "/forget-password",
    "/reset-password",
];

const ROLE_ROUTES = {
    ADMIN: ["/admin"],
    SUPERADMIN: ["/system_admin", "/superadmin"],
};

function safeVerifyToken(token: string | null) {
    if (!token) return null;
    try {
        return jwt.verify(token, JWT_SECRET) as {
            id: string;
            email: string;
            role: "ADMIN" | "SUPERADMIN";
        };
    } catch {
        return null;
    }
}

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get("token")?.value || null;
    const decoded = safeVerifyToken(token);

    const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

    if (!decoded) {
        if (!isPublicRoute) {
            const res = NextResponse.redirect(new URL("/login", req.url));
            res.cookies.delete("token");
            return res;
        }
        return NextResponse.next();
    }

    if (isPublicRoute) {
        if (decoded.role === "ADMIN") {
            return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
        if (decoded.role === "SUPERADMIN") {
            return NextResponse.redirect(new URL("/system_admin/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/login", req.url));
    }

    for (const role in ROLE_ROUTES) {
        const restrictedPaths = ROLE_ROUTES[role as keyof typeof ROLE_ROUTES];

        const isRestricted = restrictedPaths.some((r) =>
            pathname.startsWith(r)
        );

        if (isRestricted && decoded.role !== role) {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/login",
        "/forget-password",
        "/reset-password",
        "/admin/:path*",
        "/system_admin/:path*",
        "/superadmin/:path*",
        "/profile/:path*",
        "/((?!_next|.*\\..*).*)",
    ],
};
