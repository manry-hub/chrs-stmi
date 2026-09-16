import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { rateLimit as memoryRateLimit, type RateLimitResult } from "@/lib/rateLimit";

/**
 * Rate limiter yang berbagi hitungan lintas instance.
 *
 * Pengganti `rateLimit` in-memory untuk jalur yang benar-benar perlu ditahan.
 * Penyimpanan in-memory bersifat per-isolate: di serverless, setiap cold start
 * dan setiap instance punya hitungannya sendiri, sehingga batasnya praktis
 * tidak mengikat. Hitungan di Firestore berlaku untuk semua instance.
 *
 * Dokumen menyimpan `expiresAt` agar bisa dibersihkan otomatis. Aktifkan TTL
 * policy Firestore pada koleksi `rateLimits` dengan field `expiresAt`:
 *
 *   gcloud firestore fields ttls update expiresAt \
 *     --collection-group=rateLimits --enable-ttl
 *
 * Tanpa TTL policy, dokumen kedaluwarsa hanya menumpuk (tetap tidak salah
 * hitung, karena jendela waktu selalu dicek saat baca).
 */

const COLLECTION = "rateLimits";

/**
 * Doc ID Firestore tidak boleh memuat "/" maupun cocok pola `__.*__`.
 * Scope selalu diawali huruf sehingga hasilnya aman.
 */
function documentId(scope: string, key: string): string {
    const safeKey = key.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 200);
    return `${scope}_${safeKey}`;
}

export async function checkRateLimit(
    scope: string,
    key: string,
    limit: number,
    windowMs: number
): Promise<RateLimitResult> {
    const ref = adminDb.collection(COLLECTION).doc(documentId(scope, key));

    try {
        return await adminDb.runTransaction(async (tx) => {
            const snap = await tx.get(ref);
            const now = Date.now();
            const data = snap.data();

            // Jendela baru bila dokumen belum ada atau sudah lewat waktunya.
            if (!data || typeof data.resetAt !== "number" || now > data.resetAt) {
                const resetAt = now + windowMs;
                tx.set(ref, {
                    count: 1,
                    resetAt,
                    expiresAt: Timestamp.fromMillis(resetAt),
                });
                return { success: true, limit, remaining: limit - 1, reset: resetAt };
            }

            const count = typeof data.count === "number" ? data.count : 0;

            if (count >= limit) {
                return { success: false, limit, remaining: 0, reset: data.resetAt };
            }

            tx.update(ref, { count: count + 1 });
            return { success: true, limit, remaining: limit - (count + 1), reset: data.resetAt };
        });
    } catch (error) {
        // Firestore bermasalah. Menolak semua permintaan di sini berarti
        // pelaporan bahaya ikut mati, jadi kita mundur ke limiter in-memory:
        // lebih longgar, tapi sistemnya tetap hidup.
        console.error(`Rate limit store unavailable for ${scope}, falling back to in-memory:`, error);
        return memoryRateLimit(`${scope}:${key}`, limit, windowMs);
    }
}

/** Mengosongkan hitungan, mis. setelah login berhasil. */
export async function resetRateLimit(scope: string, key: string): Promise<void> {
    try {
        await adminDb.collection(COLLECTION).doc(documentId(scope, key)).delete();
    } catch (error) {
        console.error(`Failed to reset rate limit for ${scope}:`, error);
    }
}
