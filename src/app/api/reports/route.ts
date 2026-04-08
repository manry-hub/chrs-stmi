import { auth } from "@/lib/auth/auth";
import { adminDb } from "@/lib/firebase/adminApp";
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { REPORT_STATUS } from "@/constants";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { description, location, imageUrl, additionalMessage } = data;

    const reportRef = adminDb.collection("reports").doc();
    
    await reportRef.set({
      userId: session.user.id,
      userName: session.user.name,
      imageUrl,
      description,
      location,
      additionalMessage: additionalMessage || "",
      status: REPORT_STATUS.PENDING,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Add log
    await reportRef.collection("logs").add({
      action: "created",
      performedBy: session.user.id,
      note: "Pelaporan baru diajukan",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: reportRef.id });
  } catch (error: any) {
    console.error("Error submitting report", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
