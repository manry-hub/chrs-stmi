import { getUploadTicket } from "@/actions/upload/getUploadTicket";

/**
 * Mengunggah gambar laporan ke /api/upload.
 *
 * Tiket selalu diambil tepat sebelum unggah, tidak pernah disimpan bersama
 * draft: draft offline bisa mengendap berhari-hari sedangkan tiket hanya
 * berlaku beberapa menit.
 */
export async function uploadReportImage(file: File, deviceId: string): Promise<string> {
    const ticket = await getUploadTicket(deviceId);
    if (!ticket.success) {
        throw new Error(ticket.error);
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: { "x-upload-ticket": ticket.ticket },
    });

    if (!res.ok) {
        if (res.status === 429) {
            throw new Error("Terlalu banyak unggahan dari perangkat ini. Coba lagi sebentar.");
        }
        if (res.status >= 500) {
            throw new Error("Gagal mengunggah gambar karena kesalahan server.");
        }
        throw new Error("Gagal mengunggah gambar.");
    }

    const data = await res.json();
    return data.url as string;
}
