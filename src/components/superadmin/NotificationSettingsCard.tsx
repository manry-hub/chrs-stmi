"use client";

import { useState } from "react";
import { updateNotificationSettings } from "@/actions/notifications/notificationSettings";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import toast from "react-hot-toast";
import { Settings, Loader2 } from "lucide-react";

interface NotificationSettingsCardProps {
  initialThresholdHours: number;
}

export function NotificationSettingsCard({ initialThresholdHours }: NotificationSettingsCardProps) {
  const [thresholdHours, setThresholdHours] = useState(initialThresholdHours);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await updateNotificationSettings({ staleReportThresholdHours: thresholdHours });
      toast.success("Pengaturan notifikasi berhasil diperbarui!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui pengaturan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Pengaturan Notifikasi Otomatis</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Reminder dikirim setelah <span className="font-semibold text-purple-600">{thresholdHours} jam</span> laporan belum dikonfirmasi
            </p>
          </div>
        </div>
        <span className="text-slate-400 text-sm">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
          <div className="flex items-end gap-3 max-w-sm">
            <div className="flex-1">
              <Label htmlFor="threshold">Batas Waktu Pending (jam)</Label>
              <Input
                id="threshold"
                type="number"
                min={0.5}
                max={48}
                step={0.5}
                value={thresholdHours}
                onChange={(e) => setThresholdHours(Number(e.target.value))}
              />
              <p className="text-xs text-slate-400 mt-1">Min: 0.5 jam, Max: 48 jam</p>
            </div>
            <Button onClick={handleSave} disabled={loading} className="shrink-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
