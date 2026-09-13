"use client";

import { useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { sendManualNotification } from "@/actions/notifications/sendManualNotification";
import toast from "react-hot-toast";

interface NotifyAdminButtonProps {
  reportId: string;
}

export function NotifyAdminButton({ reportId }: NotifyAdminButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleNotify() {
    setLoading(true);
    try {
      await sendManualNotification(reportId);
      toast.success("Notifikasi berhasil dikirim ke penanggung jawab!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim notifikasi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleNotify();
      }}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Kirim pengingat ke penanggung jawab"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Bell className="w-3.5 h-3.5" />
      )}
      Ingatkan
    </button>
  );
}
