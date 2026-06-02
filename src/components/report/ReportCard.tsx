import React from "react";
import Link from "next/link";
import { ReportDocument } from "@/types";
import { ROUTES } from "@/constants";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { MapPin, Calendar, User } from "lucide-react";

export function ReportCard({ report }: { report: ReportDocument }) {
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
