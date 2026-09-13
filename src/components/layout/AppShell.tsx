"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { PushNotificationToggle } from "@/components/notifications/PushNotificationToggle";
import {
    LayoutDashboard,
    BarChart3,
    Users,
    FileText,
    LogOut,
    Menu,
    X,
    PanelLeftClose,
    ClipboardList,
    PlusCircle,
    TrendingUp,
    MapPin,
    ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

interface AppShellProps {
    role: UserRole;
    userName: string;
    children: React.ReactNode;
}

const USER_NAV = [
    { href: "/dashboard", label: "Lapor Baru", icon: PlusCircle },
    { href: "/dashboard/reports", label: "Riwayat Laporan", icon: ClipboardList },
];

const ADMIN_NAV = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/reports", label: "Manajemen Laporan", icon: FileText }
];

const SUPERADMIN_NAV = [
    { href: "/superadmin", label: "Dashboard Analytics", icon: BarChart3 },
    { href: "/superadmin/users", label: "Manajemen User", icon: Users },
    { href: "/superadmin/locations", label: "Manajemen Lokasi", icon: MapPin },
    { href: "/superadmin/hazard-types", label: "Manajemen Jenis Bahaya", icon: ShieldAlert },
    { href: "/superadmin/reports", label: "Manajemen Laporan", icon: FileText },
];

/**
 * Unified application shell used across all authenticated roles.
 * Renders a header, collapsible sidebar, and main content area.
 */
export function AppShell({ role, userName, children }: AppShellProps) {
    const pathname = usePathname();
    const isSuperadmin = role === "superadmin";
    const isAdmin = role === "admin";

    const navItems = isSuperadmin ? SUPERADMIN_NAV : isAdmin ? ADMIN_NAV : USER_NAV;

    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Auto-show on desktop, auto-hide on mobile
    useEffect(() => {
        const handleResize = () => {
            setSidebarOpen(window.innerWidth >= 1024);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Close sidebar on route change on mobile
    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            const timer = setTimeout(() => setSidebarOpen(false), 0);
            return () => clearTimeout(timer);
        }
    }, [pathname]);

    // Role-specific styling
    const roleBadgeClass = isSuperadmin
        ? "bg-purple-500/20 text-purple-300"
        : isAdmin
        ? "bg-blue-500/20 text-blue-300"
        : "bg-emerald-500/20 text-emerald-300";

    const roleLabel = isSuperadmin ? "kepala cs" : isAdmin ? "cleaning service" : "civitas akademika";

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* ─── Mobile Overlay ─── */}
            {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-slate-900/60 z-30 transition-opacity" onClick={() => setSidebarOpen(false)} />}

            {/* ─── Sidebar ─── */}
            <aside
                className={cn(
                    "bg-slate-900 text-white flex-shrink-0 flex flex-col min-h-screen transition-all duration-300 z-40 w-64",
                    "fixed lg:sticky lg:top-0 lg:self-start lg:h-screen",
                    sidebarOpen ? "translate-x-0 shadow-2xl lg:shadow-none" : "-translate-x-full lg:-translate-x-full lg:hidden"
                )}
            >
                {/* Sidebar Header */}
                <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 overflow-hidden">
                            <Image src="/logostmi.png" alt="logostmi" width={40} height={40} className="object-cover" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-bold tracking-wide truncate">HazardReport</h2>
                            <span
                                className={cn(
                                    "text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full inline-block mt-0.5",
                                    roleBadgeClass
                                )}
                            >
                                {roleLabel}
                            </span>
                        </div>
                    </div>

                    {/* Close Sidebar */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                        title="Sembunyikan Sidebar"
                    >
                        <X className="w-5 h-5 lg:hidden" />
                        <PanelLeftClose className="w-5 h-5 hidden lg:block" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-2">
                    
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                )}
                            >
                                <item.icon className="w-4 h-4 shrink-0" />
                                <span className="truncate">{item.label}</span>
                            </Link>
                        );
                    })}

                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-slate-800 shrink-0 bg-slate-900/50 flex flex-col gap-3">
                    <div className="px-3">
                        <p className="text-xs text-slate-400 mb-0.5">Signed in as</p>
                        <p className="text-sm font-medium text-slate-200 truncate">{userName}</p>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all duration-200"
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span className="truncate">Logout</span>
                    </button>
                </div>
            </aside>

            {/* ─── Main Content Area ─── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
                    <div className="flex items-center justify-between h-14 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            {/* Show Sidebar Toggle */}
                            {!sidebarOpen && (
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                    title="Buka Menu"
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
