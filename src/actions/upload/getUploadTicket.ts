"use server";

import { issueUploadTicket } from "@/lib/uploadTicket";

/**
 * Mengeluarkan tiket unggah untuk sebuah perangkat. Terbuka untuk publik:
 * yang membatasi penyalahgunaan adalah rate limit per-deviceId di /api/upload,
 * bukan kepemilikan akun.
 */
export async function getUploadTicket(deviceId: string) {
    const trimmed = (deviceId || "").trim();

    // deviceId tidak boleh mengandung titik: itu pemisah field di dalam tiket.
    if (!trimmed || trimmed.includes(".") || trimmed.length > 64) {
        return { success: false as const, error: "Identitas perangkat tidak valid." };
    }

    return { success: true as const, ticket: issueUploadTicket(trimmed) };
}
