import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { pathname, searchParams } = req.nextUrl;
    const loc = searchParams.get("loc");
    const isLoggedIn = !!req.auth;

    // If user is not logged in and tries to access /dashboard with a loc param,
    // redirect to /login while preserving the loc param
    if (!isLoggedIn && pathname.startsWith("/dashboard") && loc) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("loc", loc);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/dashboard/:path*"],
};
