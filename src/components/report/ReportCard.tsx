"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ReportDocument } from "@/types";
import { ROUTES } from "@/constants";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { MapPin, Calendar, User, WifiOff, RefreshCcw, AlertTriangle } from "lucide-react";
import { OfflineDraft } from "@/lib/offlineSync";

export function ReportCard({ report, offlineDraft }: { report?: ReportDocument, offlineDraft?: OfflineDraft }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (offlineDraft?.imageFile) {
      const url = URL.createObjectURL(offlineDraft.imageFile);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [offlineDraft?.imageFile]);

  if (offlineDraft) {
    const date = new Date(offlineDraft.createdAt);
    return (
      <div className="bg-white rounded-lg shadow-sm border-2 border-orange-200 overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-orange-400 animate-pulse" />
        <div className="aspect-video w-full bg-slate-100 overflow-hidden">
          <img 
            src={objectUrl || "https://via.placeholder.com/600x400?text=Offline"} 
            alt="Hazard" 
            className="w-full h-full object-cover opacity-80"
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              offlineDraft.status === "FAILED" ? "bg-red-100 text-red-700" :
              offlineDraft.status === "SYNCING" ? "bg-blue-100 text-blue-700" :
              "bg-orange-100 text-orange-700"
            }`}>
              {offlineDraft.status === "FAILED" && <AlertTriangle className="w-3 h-3" />}
              {offlineDraft.status === "SYNCING" && <RefreshCcw className="w-3 h-3 animate-spin" />}
              {offlineDraft.status === "PENDING" && <WifiOff className="w-3 h-3" />}
              {offlineDraft.status === "FAILED" ? "Gagal Mengirim" :
               offlineDraft.status === "SYNCING" ? "Mengirim..." : 
               "Menunggu Sinyal"}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mt-2" title={offlineDraft.formData.description}>
            {offlineDraft.formData.description}
          </h3>
          
          <div className="mt-3 space-y-1.5">
            <div className="flex items-start gap-2 text-xs text-slate-600">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="line-clamp-1">{offlineDraft.formData.location.name}</span>
            </div>
          </div>
          
          {offlineDraft.errorMessage && (
             <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded">
                 {offlineDraft.errorMessage}
             </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-sm text-slate-400 font-medium inline-block w-full text-center">
              Tersimpan di perangkat
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const date = report.createdAt?.toDate ? report.createdAt.toDate() : new Date(report.createdAt as any);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video w-full bg-slate-100 overflow-hidden">
        <img 
          src={report.imageUrl || "https://via.placeholder.com/600x400?text=No+Image"} 
          alt="Hazard" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <ReportStatusBadge status={report.status} />
          <span className="text-xs text-slate-500 font-medium">
            {date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mt-2" title={report.description}>
          {report.description}
        </h3>
        
        <div className="mt-3 space-y-1.5">
          <div className="flex items-start gap-2 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{report.location.name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="line-clamp-1">{report.userName}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <Link 
            href={`${ROUTES.REPORTS}/${report.id}`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-block w-full text-center"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
}
