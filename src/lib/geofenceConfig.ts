import { STMI_RADIUS_METERS } from "@/lib/utils/geofence";

/**
 * Konfigurasi verifikasi lokasi, dipakai klien maupun server.
 */

function readFlag(raw: string | undefined): string {
    return (raw || "").replace(/['"]/g, "").trim().toLowerCase();
}

export const isGeofencingEnabled = (): boolean =>
    readFlag(process.env.NEXT_PUBLIC_ENABLE_GEOFENCING) === "true";

/**
 * Batas ketidakpastian pembacaan posisi yang masih dianggap sah.
 *
 * Tanpa batas ini verifikasi kehilangan makna: pembacaan berbasis Wi-Fi/IP bisa
 * meleset beberapa kilometer, sehingga orang di rumah bisa terbaca berada di
 * tengah kampus. Bila ketidakpastiannya melebihi radius kawasan, pembacaan itu
 * secara matematis tidak bisa membuktikan apa pun.
 */
export const maxAccuracyMeters = (): number => {
    const raw = Number(readFlag(process.env.NEXT_PUBLIC_GEOFENCE_MAX_ACCURACY_METERS));
    return Number.isFinite(raw) && raw > 0 ? raw : STMI_RADIUS_METERS;
};

/** Berapa lama gerbang menunggu fix yang cukup akurat sebelum menyerah. */
export const LOCATION_TIMEOUT_MS = 25000;

/**
 * Tenggat yang diberikan ke `watchPosition` itu sendiri.
 *
 * Sengaja lebih longgar dari LOCATION_TIMEOUT_MS agar tenggat kita yang selalu
 * menang. Bila keduanya sama, dua timer habis berbarengan dan pesan yang muncul
 * jadi bergantung siapa yang lebih dulu dijalankan. Galat izin tidak terpengaruh
 * nilai ini, jadi penolakan izin tetap terdeteksi seketika.
 */
export const POSITION_ACQUISITION_TIMEOUT_MS = LOCATION_TIMEOUT_MS + 2000;
