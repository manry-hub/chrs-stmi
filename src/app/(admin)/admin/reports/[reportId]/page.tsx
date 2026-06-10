import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import { ReportDetailClient } from "@/components/admin/ReportDetailClient";
import type { ReportDocument } from "@/types";

interface ReportDetailPageProps {
  params: Promise<{ reportId: string }>;
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { reportId } = await params;

  const snap = await adminDb.collection("reports").doc(reportId).get();
  if (!snap.exists) notFound();

  const data = snap.data();

  // Serialize Firestore Timestamps to plain objects for client component
  const report: ReportDocument = {
    id: snap.id,
    userId: data?.userId ?? "",
    userName: data?.userName ?? "",
    imageUrl: data?.imageUrl ?? "",
    description: data?.description ?? "",
    location: data?.location ?? { name: "", lat: 0, lng: 0 },
    additionalMessage: data?.additionalMessage,
    status: data?.status ?? "pending",
    proofImageUrl: data?.proofImageUrl,
    createdAt: data?.createdAt ? { seconds: data.createdAt.seconds, nanoseconds: data.createdAt.nanoseconds } : { seconds: 0, nanoseconds: 0 },
    updatedAt: data?.updatedAt ? { seconds: data.updatedAt.seconds, nanoseconds: data.updatedAt.nanoseconds } : { seconds: 0, nanoseconds: 0 },
  } as ReportDocument;

  return <ReportDetailClient report={report} />;
}
