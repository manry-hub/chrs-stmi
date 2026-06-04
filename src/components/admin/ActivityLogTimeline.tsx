"use client";

import type { ReportLogDocument } from "@/types";
import { CheckCircle2, FileText } from "lucide-react";

interface ActivityLogTimelineProps {
  logs: ReportLogDocument[];
}

function formatDate(timestamp: { seconds: number } | null | undefined): string {
  if (!timestamp || !("seconds" in timestamp)) return "-";
  return new Date(timestamp.seconds * 1000).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ACTION_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  created: {
    icon: FileText,
    color: "text-blue-500 bg-blue-100",
    label: "Laporan dibuat",
  },
  confirmed: {
    icon: CheckCircle2,
    color: "text-green-500 bg-green-100",
    label: "Laporan dikonfirmasi",
  },
  done: {
    icon: CheckCircle2,
    color: "text-purple-500 bg-purple-100",
    label: "Laporan diselesaikan",
  },
};

export function ActivityLogTimeline({ logs }: ActivityLogTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        Belum ada aktivitas.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {logs.map((log, idx) => {
        const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.created;
        const Icon = config.icon;
        const isLast = idx === logs.length - 1;

        return (
          <div key={log.id} className="flex gap-3">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              {!isLast && <div className="w-0.5 flex-1 bg-slate-200 my-1" />}
            </div>
            {/* Content */}
            <div className={`pb-6 ${isLast ? "" : ""}`}>
              <p className="text-sm font-semibold text-slate-800">{config.label}</p>
              {log.note && (
                <p className="text-sm text-slate-600 mt-0.5">{log.note}</p>
              )}
              <p className="text-xs text-slate-400 mt-1">{formatDate(log.createdAt)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
