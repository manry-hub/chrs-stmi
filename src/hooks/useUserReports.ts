import { useState, useEffect } from "react";
import { ReportDocument } from "@/types";
import { subscribeToUserReports } from "@/lib/firebase/reports";

export function useUserReports(userId?: string) {
  const [reports, setReports] = useState<ReportDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    if (!userId) {
      setReports([]);
      setLoading(false);
      setError(null);
    } else {
      setLoading(true);
      setError(null);
      
      unsub = subscribeToUserReports(
        userId, 
        (newReports) => {
          setReports(newReports);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error("Firestore snapshot error:", err);
          setError(err.message || "Gagal memuat data laporan.");
          setLoading(false);
        }
      );
    }

    return unsub;
  }, [userId]);

  return { reports, loading, error };
}
