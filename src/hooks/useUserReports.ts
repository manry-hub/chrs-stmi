import { useState, useEffect } from "react";
import { onSnapshot, query, collection, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/clientApp";
import { ReportDocument } from "@/types";

export function useUserReports(userId?: string) {
  const [reports, setReports] = useState<ReportDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setReports([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "reports"), 
      where("userId", "==", userId),
      // order by is required by index usually when combined with where, wait let's just sort client side for now if indices aren't set
    );

    const unsub = onSnapshot(q, (snap) => {
      let ds = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ReportDocument));
      // Sort descending client-side to avoid strict composite index requirement initially
      ds.sort((a, b) => {
        const da = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
        const db = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
        return db - da; // desc
      });
      setReports(ds);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reports real-time:", error);
      setLoading(false);
    });

    return unsub;
  }, [userId]);

  return { reports, loading };
}
