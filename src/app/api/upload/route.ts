import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename") || "upload.jpg";

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File not provided" }, { status: 400 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // Mock upload for local development without token
      console.warn("Vercel Blob token is missing, returning a mock URL");
      return NextResponse.json({ url: "https://via.placeholder.com/600x400/eeeeee/333333?text=Mock+Upload" });
    }

    const blob = await put(file.name || filename, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
