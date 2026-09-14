import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { fileTypeFromBuffer } from "file-type";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }

  // Basic client-reported MIME check
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File harus berupa gambar" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 400 });
  }

  // Magic Bytes Validation
  const buffer = Buffer.from(await file.arrayBuffer());
  const type = await fileTypeFromBuffer(buffer);

  if (!type || !type.mime.startsWith("image/")) {
      return NextResponse.json({ error: "Format file tidak valid (Magic Bytes mismatch)" }, { status: 400 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn("Vercel Blob token is missing, returning a mock URL");
    return NextResponse.json({ url: "https://via.placeholder.com/600x400/eeeeee/333333?text=Mock+Upload" });
  }

  const blob = await put(`reports/${Date.now()}-${file.name}`, buffer, {
    access: "public",
    contentType: type.mime,
  });

  return NextResponse.json({ url: blob.url });
}
