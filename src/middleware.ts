import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { NextResponse } from "next/server";

export const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { pathname, searchParams } = req.nextUrl;
    const loc = searchParams.get("loc");
    const isLoggedIn = !!req.auth;
    const role = req.auth?.user?.role;

    // If user is not logged in and tries to access /dashboard with a loc param,
    // redirect to /login while preserving the loc param
    if (!isLoggedIn && pathname.startsWith("/dashboard") && loc) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("loc", loc);
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
