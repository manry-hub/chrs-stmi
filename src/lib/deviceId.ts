/**
 * Identitas lemah per-perangkat untuk pelapor publik (civitas akademika).
 *
 * Ini BUKAN akun dan BUKAN data pribadi: hanya UUID acak yang disimpan di
 * localStorage browser. Dipakai sebagai pengganti `userId` untuk:
 *  - doc ID subscription push notification
 *  - mengecualikan pelapor dari broadcast laporannya sendiri
 *  - kunci rate limit (lebih tepat daripada IP, karena WiFi kampus ber-NAT)
 */

const DEVICE_ID_KEY = "hr_device_id";
const REPORTER_NAME_KEY = "hr_reporter_name";

/**
 * Dipakai saat localStorage tidak tersedia (mode private, site data diblokir).
 * Umurnya hanya selama tab terbuka, tapi cukup agar pelaporan tetap jalan.
 */
let ephemeralId: string | undefined;

/**
 * Mengembalikan deviceId perangkat ini, membuatnya bila belum ada.
 * Selalu mengembalikan string agar pemanggil tidak perlu menangani kasus
 * kosong; hanya daya tahannya yang berbeda saat storage diblokir.
 */
export function getDeviceId(): string {
    if (typeof window === "undefined") {
        // SSR: nilai ini tidak pernah ikut terkirim, form hanya submit di klien.
        return "server";
    }

    try {
        const existing = window.localStorage.getItem(DEVICE_ID_KEY);
        if (existing) return existing;

        const fresh = crypto.randomUUID();
        window.localStorage.setItem(DEVICE_ID_KEY, fresh);
        return fresh;
    } catch {
        ephemeralId ||= crypto.randomUUID();
        return ephemeralId;
    }
}

/** Nama pelapor terakhir, agar pelapor berulang tidak perlu mengetik ulang. */
export function getSavedReporterName(): string {
    if (typeof window === "undefined") return "";

    try {
        return window.localStorage.getItem(REPORTER_NAME_KEY) || "";
    } catch {
        return "";
    }
}

export function saveReporterName(name: string): void {
    if (typeof window === "undefined") return;

    try {
        window.localStorage.setItem(REPORTER_NAME_KEY, name.trim());
    } catch {
        // Diabaikan: menyimpan nama hanya kemudahan, bukan keharusan.
    }
}
