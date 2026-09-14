import React from "react";
import { PhoneCall } from "lucide-react";

interface EmergencyCallButtonProps {
    phoneNumber: string;
    name: string;
}

export function EmergencyCallButton({ phoneNumber, name }: EmergencyCallButtonProps) {
    // Memastikan nomor dimulai dengan kode negara yang benar untuk API WA (misal: ganti 0 jadi 62)
    const formattedNumber = phoneNumber.startsWith("0") ? `62${phoneNumber.slice(1)}` : phoneNumber;

    return (
        <a
            href={`https://wa.me/${formattedNumber}`}
            className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white rounded-full px-5 py-3 shadow-xl flex flex-col sm:flex-row items-center gap-1 sm:gap-2 transition-all duration-300 transform hover:scale-110 active:scale-90 z-50 font-bold tracking-wide"
            aria-label={`Panggilan Darurat Satpam (${name})`}
            target="_blank"
            rel="noopener noreferrer"
        >
            <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5" />
                <span className="hidden sm:inline">Hubungi Satpam</span>
            </div>
            <span className="sm:hidden text-[10px] sm:text-xs opacity-90 sm:border-l sm:border-red-400 sm:pl-2">Satpam</span>
        </a>
    );
}
