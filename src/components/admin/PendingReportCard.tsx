import type { ReportDocument } from "@/types";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { NotifyAdminButton } from "@/components/superadmin/NotifyAdminButton";

function formatTimeAgo(timestamp: { seconds: number } | null | undefined): string {
  if (!timestamp || !("seconds" in timestamp)) return "-";
  
  const seconds = Math.floor((new Date().getTime() - timestamp.seconds * 1000) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " tahun yang lalu";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " bulan yang lalu";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " hari yang lalu";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " jam yang lalu";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " menit yang lalu";
  return Math.floor(seconds) + " detik yang lalu";
}

export function PendingReportCard({ report, showNotifyButton = false }: { report: ReportDocument; showNotifyButton?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-red-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group relative">
        {/* Urgent Indicator */}
        <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm z-10 animate-pulse">
            PERLU TINDAKAN
        </div>

      {/* Image Section */}
      <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
        {report.imageUrl ? (
          <Image
            src={report.imageUrl}
            alt="Foto Laporan"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <span className="text-sm">Tidak ada foto</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Overlay Info */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <MapPin className="w-4 h-4 text-red-400" />
            <span className="truncate">{report.location?.name || "Lokasi tidak diketahui"}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formatTimeAgo(report.createdAt)}
            </div>
            <span className="font-medium text-slate-700">Oleh: {report.userName}</span>
        </div>
        
        <p className="text-sm text-slate-800 line-clamp-2 mb-4 flex-1">
          {report.description}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link 
              href={`/admin/reports/${report.id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200"
          >
              Lihat & Konfirmasi
              <ArrowRight className="w-4 h-4" />
          </Link>
          {showNotifyButton && (
            <NotifyAdminButton reportId={report.id} />
          )}
        </div>
      </div>
    </div>
  );
}
