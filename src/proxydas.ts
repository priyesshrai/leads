import { NextResponse, NextRequest } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

const roleProtectedRoutes = {
    SUPERADMIN: ["/admin", "/superadmin", "/manage-users"],
    ADMIN: ["/admin", "/forms", "/dashboard"],
}

const publicRoutes = ["/login", "/register"]

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl
    const res = NextResponse.next()

    if (publicRoutes.some((route) => pathname.startsWith(route))) {

        return res
    }

    const token = req.cookies.get("token")?.value
    if (!token) {
        console.log("No token found, redirecting to login...")
        return NextResponse.redirect(new URL("/login", req.url))
    }

    try {
        // 3️⃣ Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: string
            role: string
            email: string
        }

        // 4️⃣ Role-based protection
        if (decoded.role === "SUPERADMIN") {
            // ✅ SuperAdmin has full access
            return res
        }

        if (decoded.role === "ADMIN") {
            // ✅ Admin has access to admin-only routes
            const isAllowed = roleProtectedRoutes.ADMIN.some((route) =>
                pathname.startsWith(route)
            )
            if (isAllowed) return res

            console.warn("Admin tried to access restricted route:", pathname)
            return NextResponse.redirect(new URL("/unauthorized", req.url))
        }

        // 5️⃣ If not SuperAdmin or Admin — block
        console.warn("Unauthorized access attempt by:", decoded.email)
        return NextResponse.redirect(new URL("/unauthorized", req.url))
    } catch (err: any) {
        console.error("JWT verification failed:", err.message)
        return NextResponse.redirect(new URL("/login", req.url))
    }
}

// 6️⃣ Define which routes run through this middleware
export const config = {
    matcher: [
        /*
          Protect everything except static files and Next internals.
          You can limit this if you want to target only specific folders.
        */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
}
