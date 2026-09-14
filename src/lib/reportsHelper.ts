import { adminDb } from "@/lib/firebase/admin";
import { calculateEffectiveMinutes } from "@/lib/businessHours";

export async function fetchReportResponseTime(reportId: string, createdAtSeconds: number | undefined): Promise<number | null> {
    if (!createdAtSeconds) return null;
    
    const logsSnap = await adminDb
        .collection("reports")
        .doc(reportId)
        .collection("logs")
        .where("action", "==", "confirmed")
        .orderBy("createdAt", "asc")
        .limit(1)
        .get();

    if (!logsSnap.empty) {
        const confirmedTime = logsSnap.docs[0].data().createdAt?.seconds ?? 0;
        if (confirmedTime) {
            return calculateEffectiveMinutes(createdAtSeconds, confirmedTime);
        }
    }
    return null;
}
