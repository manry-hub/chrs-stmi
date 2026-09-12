"use server";

import { adminDb } from "@/lib/firebase/admin";
import { auth } from "@/lib/auth";

export interface AdminPerformance {
    adminId: string;
    adminName: string;
    totalAssigned: number;
    totalDone: number;
    totalPending: number;
    locations: string[];
}

export async function getAdminPerformance(): Promise<AdminPerformance[]> {
    const session = await auth();
    if (session?.user?.role !== "superadmin") {
        return [];
    }

    try {
        // 1. Get all locations to find out which admin handles which location
        const locSnapshot = await adminDb.collection("locations").get();
        const locations = locSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const adminMap: Record<string, AdminPerformance> = {};

        locations.forEach((loc: any) => {
            if (loc.adminId) {
                if (!adminMap[loc.adminId]) {
                    adminMap[loc.adminId] = {
                        adminId: loc.adminId,
                        adminName: loc.adminName || "Unknown Admin",
                        totalAssigned: 0,
                        totalDone: 0,
                        totalPending: 0,
                        locations: [],
                    };
                }
                adminMap[loc.adminId].locations.push(loc.name);
            }
        });

        // 2. Get all reports that have assignedAdminId
        const reportsSnapshot = await adminDb.collection("reports").get();
        reportsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.assignedAdminId && adminMap[data.assignedAdminId]) {
                const adminStats = adminMap[data.assignedAdminId];
                adminStats.totalAssigned++;
                if (data.status === "done") {
                    adminStats.totalDone++;
                } else {
                    adminStats.totalPending++;
                }
            }
        });

        return Object.values(adminMap);
    } catch (error) {
        console.error("Error fetching admin performance:", error);
        return [];
    }
}
