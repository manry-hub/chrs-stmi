import React from "react";
import { ReportStatus } from "@/types";
import { REPORT_STATUS } from "@/constants";

const STATUS_CONFIG: Record<ReportStatus, { label: string; className: string }> = {
  [REPORT_STATUS.PENDING]: {
    label: "Belum Dikonfirmasi",
    className: "bg-yellow-100 text-yellow-800",
  },
  [REPORT_STATUS.CONFIRMED]: {
    label: "Dikonfirmasi",
    className: "bg-green-100 text-green-800",
  },
  [REPORT_STATUS.DONE]: {
    label: "Selesai",
    className: "bg-purple-100 text-purple-800",
  },
};

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[REPORT_STATUS.PENDING];

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}
