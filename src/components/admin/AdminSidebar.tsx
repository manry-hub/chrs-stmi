"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard,
    BarChart3,
    Users,
    FileText,
    LogOut,
    Shield,
    ShieldCheck,
    Menu,
    X,
    PanelLeftClose,
    ClipboardList,
    PlusCircle,
    UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

interface AdminSidebarProps {
    role: UserRole;
    userName: string;
}

const USER_NAV = [
    { href: "/dashboard", label: "Lapor Baru", icon: PlusCircle },
    { href: "/dashboard/reports", label: "Riwayat Laporan", icon: ClipboardList },
];

const ADMIN_NAV = [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }];

const SUPERADMIN_NAV = [
    { href: "/superadmin", label: "Analytics", icon: BarChart3 },
    { href: "/superadmin/users", label: "Manajemen User", icon: Users },
    { href: "/superadmin/reports", label: "Manajemen Laporan", icon: FileText },
];

/**
 * Unified sidebar used across all authenticated roles: user, admin, superadmin.
 * Auto-hides on mobile viewports and supports manual toggle on desktop.
 */
export function AdminSidebar({ role, userName }: AdminSidebarProps) {
    const pathname = usePathname();
    const isSuperadmin = role === "superadmin";
    const isAdmin = role === "admin";
    const isUser = role === "user";

    // Determine the primary nav items based on role
    const navItems = isSuperadmin ? SUPERADMIN_NAV : isAdmin ? ADMIN_NAV : USER_NAV;

    const [isOpen, setIsOpen] = useState(false);

    // Auto-hide on mobile resize
    useEffect(() => {
        const handleResize = () => {
            setIsOpen(window.innerWidth >= 1024);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Close sidebar on route change on mobile
    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            setIsOpen(false);
        }
    }, [pathname]);

    // Role badge color
    const roleBadgeClass = isSuperadmin
        ? "bg-purple-500/20 text-purple-300"
        : isAdmin
        ? "bg-blue-500/20 text-blue-300"
        : "bg-emerald-500/20 text-emerald-300";

    // Role icon
    const RoleIcon = isSuperadmin ? ShieldCheck : isAdmin ? Shield : UserCircle;

    // Role display label
    const roleLabel = isSuperadmin ? "superadmin" : isAdmin ? "admin" : "user";

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && <div className="lg:hidden fixed inset-0 bg-slate-900/60 z-30 transition-opacity" onClick={() => setIsOpen(false)} />}

            {/* Main Sidebar */}
            <aside
                className={cn(
                    "bg-slate-900 text-white flex-shrink-0 flex flex-col min-h-screen transition-all duration-300 z-40 w-64",
                    "fixed lg:relative",
                    isOpen ? "translate-x-0 lg:ml-0 shadow-2xl lg:shadow-none" : "-translate-x-full lg:translate-x-0 lg:-ml-64"
                )}
            >
                {/* Header */}
                <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                            <img src="logostmi.png" alt="logostmi" />
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

                    {/* Hide Sidebar Button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                        title="Sembunyikan Sidebar"
                    >
                        <X className="w-5 h-5 lg:hidden" />
                        <PanelLeftClose className="w-5 h-5 hidden lg:block" />
                    </button>
                </div>

                {/* User Info */}
                <div className="px-5 py-4 border-b border-slate-800 shrink-0">
                    <p className="text-xs text-slate-400 mb-1">Signed in as</p>
                    <p className="text-sm font-medium text-slate-200 truncate">{userName}</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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

                    {/* Superadmin also sees admin dashboard */}
                    {isSuperadmin && (
                        <>
                            <div className="pt-4 pb-2 px-3">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin View</p>
                            </div>
                            {ADMIN_NAV.map((item) => {
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
                        </>
                    )}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-slate-800 shrink-0 bg-slate-900/50">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all duration-200"
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span className="truncate">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Desktop Show Sidebar Button (When Sidebar Collapsed) */}
            {!isOpen && (
                <div className="hidden lg:flex flex-col border-r border-slate-200 bg-slate-50 border-dashed w-16 shrink-0 min-h-screen transition-all duration-300">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="m-3 p-2 bg-white text-slate-700 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-100 hover:text-blue-600 transition-colors flex items-center justify-center"
                        title="Tampilkan Sidebar"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Mobile Show Sidebar Button (Floating Action Button) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="lg:hidden fixed top-6 left-6 z-40 p-3.5 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 active:scale-95 transition-transform"
                    title="Menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
            )}
        </>
    );
}
