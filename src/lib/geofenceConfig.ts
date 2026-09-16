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
