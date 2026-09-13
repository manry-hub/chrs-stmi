"use server";

import { adminDb } from "@/lib/firebase/admin";
import { auth } from "@/lib/auth";
import { FieldValue } from "firebase-admin/firestore";

const SETTINGS_DOC = "notification_settings";

interface NotificationSettings {
  staleReportThresholdHours: number;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  staleReportThresholdHours: 2,
};

/**
 * Get notification settings from Firestore.
 * Falls back to defaults if not configured.
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const doc = await adminDb.collection("settings").doc(SETTINGS_DOC).get();
    if (!doc.exists) return DEFAULT_SETTINGS;

    const data = doc.data();
    return {
      staleReportThresholdHours: data?.staleReportThresholdHours ?? DEFAULT_SETTINGS.staleReportThresholdHours,
    };
  } catch (error) {
    console.error("Error getting notification settings:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update notification settings. Superadmin only.
 */
export async function updateNotificationSettings(settings: { staleReportThresholdHours: number }) {
  const session = await auth();
  if (!session || session.user.role !== "superadmin") {
    throw new Error("Unauthorized: Hanya superadmin yang dapat mengubah pengaturan.");
  }

  if (settings.staleReportThresholdHours < 0.5 || settings.staleReportThresholdHours > 48) {
    throw new Error("Threshold harus antara 0.5 - 48 jam.");
  }

  try {
    await adminDb.collection("settings").doc(SETTINGS_DOC).set(
      {
        staleReportThresholdHours: settings.staleReportThresholdHours,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw new Error("Gagal memperbarui pengaturan notifikasi.");
  }
}
