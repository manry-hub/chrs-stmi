"use client";

import { useEffect, useState } from "react";
import { getDrafts, updateDraftStatus, deleteDraft, OfflineDraft } from "@/lib/offlineSync";
import { submitReport } from "@/actions/reports/submitReport";
import toast from "react-hot-toast";

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined") return;

        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            syncDrafts();
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Also check periodically in case 'online' event is missed or background sync fails
        const intervalId = setInterval(() => {
            if (navigator.onLine) syncDrafts();
        }, 60000); // Check every minute

        // Initial sync on mount if online
        if (navigator.onLine) {
            syncDrafts();
        }

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            clearInterval(intervalId);
        };
    }, []);

    const syncDrafts = async () => {
        const drafts = await getDrafts();
        if (drafts.length === 0) return;

        // Find drafts that are PENDING or FAILED to retry
        const draftsToSync = drafts.filter(d => d.status === "PENDING" || d.status === "FAILED");
        
        for (const draft of draftsToSync) {
            try {
                await updateDraftStatus(draft.id, "SYNCING");
                
                // 1. Upload Image
                const formData = new FormData();
                formData.append("file", draft.imageFile);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) {
                    if (uploadRes.status >= 500) {
                        throw new Error("Kesalahan server saat mengunggah gambar.");
                    }
                    throw new Error("Gagal mengunggah gambar laporan.");
                }

                const uploadData = await uploadRes.json();
                const imageUrl = uploadData.url;

                // 2. Submit Report
                const payload = {
                    ...draft.formData,
                    draftId: draft.id,
                    imageUrl,
                    image: undefined, // remove file
                };

                const res = await submitReport(payload);

                if (!res.success) {
                    throw new Error("Gagal mengirim laporan ke server.");
                }

                // 3. Delete Draft on Success
                await deleteDraft(draft.id);
                toast.success("1 Laporan Draft berhasil disinkronisasi!");
            } catch (error: any) {
                console.error(`Failed to sync draft ${draft.id}:`, error);
                
                // If it's a network error during sync, we mark it as FAILED or PENDING to retry
                const isNetworkError = error instanceof TypeError && error.message === "Failed to fetch";
                const errorMessage = isNetworkError ? "Koneksi terputus saat sinkronisasi" : (error.message || "Gagal sinkronisasi");
                
                await updateDraftStatus(draft.id, "FAILED", errorMessage);
                // Optionally show a toast for failure, but it might be annoying if it fails repeatedly in background
                // toast.error(`Gagal sinkronisasi laporan: ${errorMessage}`);
            }
        }
    };

    return <>{children}</>;
}
