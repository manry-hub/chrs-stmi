import { createHmac, timingSafeEqual } from "crypto";

/**
 * Tiket unggah berumur pendek.
 *
 * Sejak pelaporan dibuka untuk publik, /api/upload tidak lagi bisa bersandar
 * pada sesi login. Tanpa gerbang pengganti, endpoint itu menjadi image hosting
 * gratis yang menulis ke Vercel Blob atas tagihan kita.
 *
 * Tiket dikeluarkan server action dan diverifikasi route handler. Tiket TIDAK
 * BOLEH disimpan di dalam draft IndexedDB: draft bisa mengendap berhari-hari
 * di area tanpa sinyal, sedangkan tiket hanya berlaku beberapa menit. Ambil
 * tiket baru tepat sebelum mengunggah.
 */

const TICKET_TTL_MS = 5 * 60 * 1000;

function secret(): string {
    const value = process.env.AUTH_SECRET;
    if (!value) {
        throw new Error("AUTH_SECRET belum diset; tiket unggah tidak dapat dibuat.");
    }
    return value;
}

function sign(payload: string): string {
    return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function issueUploadTicket(deviceId: string): string {
    const payload = `${deviceId}.${Date.now() + TICKET_TTL_MS}`;
    return `${payload}.${sign(payload)}`;
}

export interface VerifiedTicket {
    deviceId: string;
}

/** Mengembalikan tiket terverifikasi, atau null bila tidak sah/kedaluwarsa. */
export function verifyUploadTicket(ticket: string | null): VerifiedTicket | null {
    if (!ticket) return null;

    const parts = ticket.split(".");
    if (parts.length !== 3) return null;

    const [deviceId, expiresAt, signature] = parts;
    const expected = sign(`${deviceId}.${expiresAt}`);

    const given = Buffer.from(signature);
    const want = Buffer.from(expected);
    if (given.length !== want.length || !timingSafeEqual(given, want)) return null;

    const expiry = Number(expiresAt);
    if (!Number.isFinite(expiry) || Date.now() > expiry) return null;

    return { deviceId };
}
