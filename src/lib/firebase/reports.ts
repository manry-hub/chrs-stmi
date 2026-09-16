import { db } from "./client";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import type { ReportDocument, ReportLogDocument } from "@/types";

export const reportsRef = collection(db, "reports");

export function subscribeToAllReportsAdmin(cb: (reports: ReportDocument[]) => void, onError?: (err: Error) => void) {
  const q = query(reportsRef, orderBy("createdAt", "desc"));
  return onSnapshot(
    q, 
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ReportDocument)),
    (err) => onError?.(err)
  );
}

export function subscribeToReportLogs(reportId: string, cb: (logs: ReportLogDocument[]) => void, onError?: (err: Error) => void) {
  const logsRef = collection(db, "reports", reportId, "logs");
  const q = query(logsRef, orderBy("createdAt", "asc"));
  return onSnapshot(
    q, 
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ReportLogDocument)),
    (err) => onError?.(err)
  );
}
