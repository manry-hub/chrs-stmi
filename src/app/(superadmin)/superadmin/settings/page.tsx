import { getNotificationSettings } from "@/actions/notifications/notificationSettings";
import { getEmergencyContacts } from "@/actions/settings/emergencyContacts";
import { NotificationSettingsCard } from "@/components/superadmin/NotificationSettingsCard";
import { EmergencyContactSettingsCard } from "@/components/superadmin/EmergencyContactSettingsCard";

export const revalidate = 0;

export default async function SettingsPage() {
  const [notifSettings, emergencyContacts] = await Promise.all([
    getNotificationSettings(),
    getEmergencyContacts(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 sm:mb-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Pengaturan Sistem</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Konfigurasi parameter aplikasi, notifikasi otomatis, dan kontak darurat.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <NotificationSettingsCard initialThresholdHours={notifSettings.staleReportThresholdHours} />
        <EmergencyContactSettingsCard initialData={emergencyContacts} />
      </div>
    </div>
  );
}
