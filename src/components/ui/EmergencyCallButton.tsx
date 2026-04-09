import React from "react";
import { PhoneCall } from "lucide-react";

export function EmergencyCallButton() {
    const SATPAM_NUMBER = process.env.NEXT_PUBLIC_EMERGENCY_NUMBER;

    return (
        <a
            href={`https://wa.me/${SATPAM_NUMBER}`}
            className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white rounded-full px-5 py-3 shadow-lg flex items-center gap-2 transition-transform transform hover:scale-105 z-50 font-medium"
            aria-label="Panggilan Darurat Satpam"
        >
            <PhoneCall className="w-5 h-5" />
            <span>Hubungi Satpam</span>
        </a>
    );
}
