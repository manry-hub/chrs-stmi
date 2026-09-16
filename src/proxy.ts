import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { NextResponse } from "next/server";

export const { auth } = NextAuth(authConfig);

import { rateLimit } from "@/lib/rateLimit";

export default auth((req) => {
    const { pathname, searchParams } = req.nextUrl;

    // Simple in-memory rate limiting for sensitive endpoints
    // Note: State is per-isolate in Edge/Serverless environments
    if (pathname.startsWith("/api/auth/")) {
        // Using x-forwarded-for as req.ip is not available on NextAuthRequest type
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        const { success } = rateLimit(ip, 50, 900000);
        if (!success) {
            return new NextResponse("Too Many Requests", { status: 429 });
        }
    }

    const loc = searchParams.get("loc");
    const isLoggedIn = !!req.auth;
    const role = req.auth?.user?.role;

    // Pelaporan kini publik. QR code yang sudah tercetak dan tertempel di gedung
    // masih mengarah ke /dashboard?loc=..., jadi jalur lama dipertahankan
    // sebagai redirect agar poster yang beredar tidak mati.
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
        const laporUrl = new URL("/lapor", req.url);
        if (loc) laporUrl.searchParams.set("loc", loc);
        return NextResponse.redirect(laporUrl);
    }

    // Role-based redirection if already logged in and trying to access auth pages.
    // Hanya admin & kepala CS yang punya area khusus; akun civitas lama diarahkan
    // ke form publik.
    if (isLoggedIn && pathname === "/login") {
        if (role === "superadmin") {
            return NextResponse.redirect(new URL("/superadmin", req.url));
        } else if (role === "admin") {
            return NextResponse.redirect(new URL("/admin", req.url));
        }
        return NextResponse.redirect(new URL("/lapor", req.url));
    }

    if (isLoggedIn && pathname === "/") {
        if (role === "superadmin") {
            return NextResponse.redirect(new URL("/superadmin", req.url));
        } else if (role === "admin") {
            return NextResponse.redirect(new URL("/admin", req.url));
        }
        // Role "user" (akun lama) tetap boleh melihat landing page.
    }

    // Role protection for main route segments
    if (pathname.startsWith("/superadmin") && role !== "superadmin") {
        return NextResponse.redirect(new URL(isLoggedIn ? "/lapor" : "/login", req.url));
    }

    // Kepala CS ikut diizinkan: halaman detail laporan di /superadmin/reports
    // menaut ke /admin/reports/[id], dan layout (admin) memang membuka aksesnya
    // untuk kedua role.
    if (pathname.startsWith("/admin") && role !== "admin" && role !== "superadmin") {
        return NextResponse.redirect(new URL(isLoggedIn ? "/lapor" : "/login", req.url));
    }

    return NextResponse.next();
});

export const config = {
    // /api/auth ikut dicocokkan agar rate limit di atas benar-benar berjalan;
    // sebelumnya seluruh /api tersaring sehingga blok itu tidak pernah dieksekusi.
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
        "/api/auth/:path*",
    ],
};
