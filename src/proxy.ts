import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { NextResponse } from "next/server";

export const { auth } = NextAuth(authConfig);

import { rateLimit } from "@/lib/rateLimit";

export default auth((req) => {
    const { pathname, searchParams } = req.nextUrl;
    
    // Simple in-memory rate limiting for sensitive endpoints
    // Note: State is per-isolate in Edge/Serverless environments
    if (pathname.startsWith("/api/auth/") || pathname === "/api/upload") {
        // Using x-forwarded-for as req.ip is not available on NextAuthRequest type
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const limit = pathname === "/api/upload" ? 100 : 50; // High limit for E2E tests
        const windowMs = pathname === "/api/upload" ? 60000 : 900000;
        
        const { success } = rateLimit(ip, limit, windowMs);
        if (!success) {
            return new NextResponse("Too Many Requests", { status: 429 });
        }
    }

    const loc = searchParams.get("loc");
    const isLoggedIn = !!req.auth;
    const role = req.auth?.user?.role;

    // If user is not logged in and tries to access /dashboard, redirect to /login
    if (!isLoggedIn && pathname.startsWith("/dashboard")) {
        const loginUrl = new URL("/login", req.url);
        if (loc) loginUrl.searchParams.set("loc", loc);
        return NextResponse.redirect(loginUrl);
    }

    // Role-based redirection if already logged in and trying to access auth/public pages
    if (isLoggedIn && (pathname === "/login" || pathname === "/register" || pathname === "/")) {
        if (role === "superadmin") {
            return NextResponse.redirect(new URL("/superadmin", req.url));
        } else if (role === "admin") {
            return NextResponse.redirect(new URL("/admin", req.url));
        } else {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    }

    // Role protection for main route segments
    if (pathname.startsWith("/superadmin") && role !== "superadmin") {
        return NextResponse.redirect(new URL(isLoggedIn ? "/dashboard" : "/login", req.url));
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
        return NextResponse.redirect(new URL(isLoggedIn ? "/dashboard" : "/login", req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
