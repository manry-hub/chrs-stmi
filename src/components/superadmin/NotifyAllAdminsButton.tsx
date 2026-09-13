"use client";

import { useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { sendBulkManualNotification } from "@/actions/notifications/sendManualNotification";
import toast from "react-hot-toast";

interface NotifyAllAdminsButtonProps {
  reportIds: string[];
}

export function NotifyAllAdminsButton({ reportIds }: NotifyAllAdminsButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleNotifyAll() {
    if (reportIds.length === 0) return;
    
    setLoading(true);
    try {
      const result = await sendBulkManualNotification(reportIds);
      toast.success(`Berhasil mengirim pengingat untuk ${result.count} laporan!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim notifikasi");
    } finally {
      setLoading(false);
    }
  }

  if (reportIds.length === 0) return null;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleNotifyAll();
      }}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white rounded-full text-[11px] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Kirim pengingat untuk semua laporan pending ini"
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Bell className="w-3 h-3" />
      )}
      Ingatkan Semua ({reportIds.length})
    </button>
  );
}
