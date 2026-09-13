"use server";

import { adminDb } from "@/lib/firebase/admin";
import { auth } from "@/lib/auth";
import { DateFilterRange, isWithinDateRange } from "@/lib/utils";

export interface AdminPerformance {
    adminId: string;
    adminName: string;
    totalAssigned: number;
    totalDone: number;
    totalPending: number;
    locations: string[];
    avgResponseMinutes: number | null;
}

export async function getAdminPerformance(dateFilter: DateFilterRange = "hari"): Promise<AdminPerformance[]> {
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
            // Support both old (single adminId) and new (adminIds array) format
            const ids: string[] = loc.adminIds || (loc.adminId ? [loc.adminId] : []);
            const names: string[] = loc.adminNames || (loc.adminName ? [loc.adminName] : []);

            ids.forEach((adminId: string, index: number) => {
                if (!adminMap[adminId]) {
                    adminMap[adminId] = {
                        adminId,
                        adminName: names[index] || "Unknown Admin",
                        totalAssigned: 0,
                        totalDone: 0,
                        totalPending: 0,
                        locations: [],
                        avgResponseMinutes: null,
                    };
                }
                adminMap[adminId].locations.push(loc.name);
            });
        });

        // 2. Get all reports that have assignedAdminId
        const reportsSnapshot = await adminDb.collection("reports").get();
        
        // Prepare to fetch response times
        const responsePromises: Promise<{ adminId: string; responseTime: number | null }>[] = [];

        reportsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            
            // Check if this document falls into our date range
            const docDate = data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : null;
            if (!isWithinDateRange(docDate, dateFilter)) return;

            if (data.assignedAdminId && adminMap[data.assignedAdminId]) {
                const adminStats = adminMap[data.assignedAdminId];
                adminStats.totalAssigned++;
                if (data.status === "done") {
                    adminStats.totalDone++;
                } else {
                    adminStats.totalPending++;
                }

                // If confirmed or done, calculate response time
                if (data.status === "confirmed" || data.status === "done") {
                    const promise = adminDb
                        .collection("reports")
                        .doc(doc.id)
                        .collection("logs")
                        .where("action", "==", "confirmed")
                        .orderBy("createdAt", "asc")
                        .limit(1)
                        .get()
                        .then(logsSnap => {
                            if (!logsSnap.empty) {
                                const created = data.createdAt?.seconds ?? 0;
                                const confirmedTime = logsSnap.docs[0].data().createdAt?.seconds ?? 0;
                                if (created && confirmedTime) {
                                    return { adminId: data.assignedAdminId, responseTime: (confirmedTime - created) / 60 };
                                }
                            }
                            return { adminId: data.assignedAdminId, responseTime: null };
                        });
                    responsePromises.push(promise);
                }
            }
        });

        // 3. Resolve response times
        const responseResults = await Promise.all(responsePromises);
        const adminResponseTimes: Record<string, number[]> = {};
        
        responseResults.forEach(res => {
            if (res.responseTime !== null) {
                if (!adminResponseTimes[res.adminId]) adminResponseTimes[res.adminId] = [];
                adminResponseTimes[res.adminId].push(res.responseTime);
            }
        });

        const performances = Object.values(adminMap).map(admin => {
            const times = adminResponseTimes[admin.adminId] || [];
            const avg = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : null;
            return {
                ...admin,
                avgResponseMinutes: avg
            };
        });

        return performances;
    } catch (error) {
        console.error("Error fetching admin performance:", error);
        return [];
    }
}
