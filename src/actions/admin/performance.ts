"use server";

import { adminDb } from "@/lib/firebase/admin";
import { auth } from "@/lib/auth";
import { DateFilterRange, isWithinDateRange } from "@/lib/utils";
import { fetchReportResponseTime } from "@/lib/reportsHelper";

export interface AdminPerformance {
    adminId: string;
    adminName: string;
    totalAssigned: number;
    totalDone: number;
    totalPending: number;
    locations: string[];
    avgResponseMinutes: number | null;
}

export interface LocationPerformance {
    locationName: string;
    adminNames: string[];
    totalAssigned: number;
    totalDone: number;
    totalPending: number;
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

            // Laporan spam tidak dihitung sebagai beban kerja siapa pun.
            if (data.isSpam === true) return;

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
                    const promise = fetchReportResponseTime(doc.id, data.createdAt?.seconds).then(responseTime => ({
                        adminId: data.assignedAdminId,
                        responseTime
                    }));
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

export async function getLocationPerformance(dateFilter: DateFilterRange = "hari"): Promise<LocationPerformance[]> {
    const session = await auth();
    if (session?.user?.role !== "superadmin") {
        return [];
    }

    try {
        // 1. Get all locations to find out which admin handles which location
        const locSnapshot = await adminDb.collection("locations").get();
        const locations = locSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const locationMap: Record<string, LocationPerformance & { responseTimes: number[] }> = {};

        locations.forEach((loc: any) => {
            const names: string[] = loc.adminNames || (loc.adminName ? [loc.adminName] : []);
            if (!locationMap[loc.name]) {
                locationMap[loc.name] = {
                    locationName: loc.name,
                    adminNames: names,
                    totalAssigned: 0,
                    totalDone: 0,
                    totalPending: 0,
                    avgResponseMinutes: null,
                    responseTimes: []
                };
            }
        });

        // 2. Get all reports
        const reportsSnapshot = await adminDb.collection("reports").get();
        
        // Prepare to fetch response times
        const responsePromises: Promise<{ locationName: string; responseTime: number | null }>[] = [];

        reportsSnapshot.docs.forEach(doc => {
            const data = doc.data();

            // Laporan spam tidak dihitung sebagai beban kerja siapa pun.
            if (data.isSpam === true) return;

            // Check if this document falls into our date range
            const docDate = data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : null;
            if (!isWithinDateRange(docDate, dateFilter)) return;

            const locName = data.location?.name;

            if (locName && locationMap[locName]) {
                const locStats = locationMap[locName];
                locStats.totalAssigned++;
                if (data.status === "done") {
                    locStats.totalDone++;
                } else {
                    locStats.totalPending++;
                }

                // If confirmed or done, calculate response time
                if (data.status === "confirmed" || data.status === "done") {
                    const promise = fetchReportResponseTime(doc.id, data.createdAt?.seconds).then(responseTime => ({
                        locationName: locName,
                        responseTime
                    }));
                    responsePromises.push(promise);
                }
            }
        });

        // 3. Resolve response times
        const responseResults = await Promise.all(responsePromises);
        
        responseResults.forEach(res => {
            if (res.responseTime !== null && locationMap[res.locationName]) {
                locationMap[res.locationName].responseTimes.push(res.responseTime);
            }
        });

        const performances = Object.values(locationMap).map(loc => {
            const times = loc.responseTimes;
            const avg = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : null;
            return {
                locationName: loc.locationName,
                adminNames: loc.adminNames,
                totalAssigned: loc.totalAssigned,
                totalDone: loc.totalDone,
                totalPending: loc.totalPending,
                avgResponseMinutes: avg
            };
        });

        return performances;
    } catch (error) {
        console.error("Error fetching location performance:", error);
        return [];
    }
}
