import { isWithinSTMI, STMI_RADIUS_METERS } from "@/lib/utils/geofence";
import { maxAccuracyMeters, LOCATION_TIMEOUT_MS, POSITION_ACQUISITION_TIMEOUT_MS } from "@/lib/geofenceConfig";

export type CampusLocationResult =
    | { ok: true; lat: number; lng: number; accuracy: number }
    | { ok: false; reason: "unsupported" | "denied" | "outside" | "inaccurate" | "unavailable"; message: string };

/**
 * Mengambil posisi perangkat dan memastikan berada di kawasan kampus.
 *
 * Dipanggil saat laporan dikirim. Bila gagal, laporan tidak boleh tersimpan
 * ke mana pun, termasuk sebagai draft offline: draft tanpa koordinat akan
 * selalu ditolak server saat disinkronkan, jadi menyimpannya hanya menghasilkan
 * antrean yang gagal selamanya tanpa pelapor tahu.
 *
 * GPS sendiri tidak butuh internet, jadi fungsi ini tetap bekerja saat offline.
 */
export function acquireCampusLocation(): Promise<CampusLocationResult> {
    return new Promise((resolve) => {
        if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
            resolve({
                ok: false,
                reason: "unsupported",
                message: "Perangkat atau browser ini tidak mendukung layanan lokasi, sehingga laporan tidak dapat dikirim.",
            });
            return;
        }

        const limit = maxAccuracyMeters();
        let best: number | null = null;
        let watchId: number | null = null;
        let settled = false;

        const finish = (result: CampusLocationResult) => {
            if (settled) return;
            settled = true;
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
            clearTimeout(deadline);
            resolve(result);
        };

        const deadline = setTimeout(() => {
            finish(
                best === null
                    ? {
                          ok: false,
                          reason: "unavailable",
                          message: "Lokasi tidak terdeteksi. Pastikan GPS aktif, lalu kirim ulang laporan.",
                      }
                    : {
                          ok: false,
                          reason: "inaccurate",
                          message: `Akurasi lokasi hanya ±${Math.round(best)} m, terlalu kasar untuk memastikan Anda berada di kawasan kampus (dibutuhkan ±${limit} m atau lebih baik). Coba dekati jendela atau area terbuka.`,
                      }
            );
        }, LOCATION_TIMEOUT_MS);

        // watchPosition, bukan getCurrentPosition: pembacaan pertama biasanya
        // perkiraan jaringan yang kasar, lalu menajam saat GNSS mengunci.
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;

                if (best === null || accuracy < best) best = accuracy;

                // Belum cukup meyakinkan; tunggu pembacaan berikutnya.
                if (accuracy > limit) return;

                if (!isWithinSTMI(latitude, longitude)) {
                    finish({
                        ok: false,
                        reason: "outside",
                        message: `Laporan ditolak: Anda berada di luar kawasan Politeknik STMI Jakarta (radius ${STMI_RADIUS_METERS} m).`,
                    });
                    return;
                }

                finish({ ok: true, lat: latitude, lng: longitude, accuracy });
            },
            (error) => {
                finish(
                    error.code === error.PERMISSION_DENIED
                        ? {
                              ok: false,
                              reason: "denied",
                              message: "Izin lokasi ditolak. Verifikasi lokasi wajib untuk melapor — aktifkan izin lokasi untuk situs ini, lalu kirim ulang.",
                          }
                        : {
                              ok: false,
                              reason: "unavailable",
                              message: "Sinyal lokasi tidak tertangkap. Coba dekati jendela atau area terbuka, lalu kirim ulang laporan.",
                          }
                );
            },
            { enableHighAccuracy: true, timeout: POSITION_ACQUISITION_TIMEOUT_MS, maximumAge: 0 }
        );
    });
}
