"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { MapPin, Loader2, ShieldAlert, RefreshCcw, Ban } from "lucide-react";
import { isWithinSTMI, STMI_RADIUS_METERS } from "@/lib/utils/geofence";
import { isGeofencingEnabled, maxAccuracyMeters, LOCATION_TIMEOUT_MS } from "@/lib/geofenceConfig";
import { Button } from "@/components/ui/Button";

export interface VerifiedLocation {
    lat: number;
    lng: number;
    accuracy: number;
}

const VerifiedLocationContext = createContext<VerifiedLocation | null>(null);

/** Koordinat yang sudah lolos verifikasi gerbang, atau null bila geofencing mati. */
export const useVerifiedLocation = () => useContext(VerifiedLocationContext);

type GateState =
    | { status: "checking"; bestAccuracy: number | null }
    | { status: "verified"; location: VerifiedLocation }
    | { status: "outside"; distanceKnown: boolean }
    | { status: "denied" }
    | { status: "unavailable"; reason: string };

/**
 * Menahan akses ke form pelaporan sampai posisi perangkat terverifikasi berada
 * di kawasan kampus.
 *
 * Konsekuensi yang disengaja: tanpa fix GPS yang cukup akurat, form tidak
 * terbuka sama sekali — termasuk untuk membuat draft offline. Ini pilihan
 * kebijakan, bukan keterbatasan teknis.
 *
 * Perlu dicatat bahwa gerbang ini menjaga halaman, bukan endpoint. `submitReport`
 * tetap memverifikasi ulang koordinat di server.
 */
export function LocationGate({ children }: { children: React.ReactNode }) {
    const geofencingOn = isGeofencingEnabled();
    const [state, setState] = useState<GateState>({ status: "checking", bestAccuracy: null });
    // Dinaikkan tombol "Coba lagi" untuk memicu ulang effect di bawah.
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (!geofencingOn) return;

        const limit = maxAccuracyMeters();
        let best: number | null = null;
        let watchId: number | null = null;

        const stop = () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
            }
            clearTimeout(deadline);
        };

        const deadline = setTimeout(() => {
            stop();
            setState({
                status: "unavailable",
                reason:
                    best === null
                        ? "Lokasi tidak terdeteksi dalam batas waktu. Pastikan GPS aktif."
                        : `Akurasi lokasi hanya ±${Math.round(best)} m, terlalu kasar untuk memastikan Anda berada di kawasan kampus (dibutuhkan ±${limit} m atau lebih baik).`,
            });
        }, LOCATION_TIMEOUT_MS);

        if (!("geolocation" in navigator)) {
            // Ditunda satu microtask agar effect ini tidak menulis state secara
            // sinkron dan memicu render berantai.
            queueMicrotask(() =>
                setState({ status: "unavailable", reason: "Perangkat atau browser ini tidak mendukung layanan lokasi." })
            );
            return stop;
        }

        // watchPosition, bukan getCurrentPosition: fix pertama biasanya berasal
        // dari perkiraan jaringan yang kasar, lalu menajam saat GNSS mengunci.
        // Menunggu pembacaan yang cukup akurat jauh lebih andal daripada
        // mengambil tembakan tunggal.
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;

                if (best === null || accuracy < best) {
                    best = accuracy;
                    setState((prev) => (prev.status === "checking" ? { status: "checking", bestAccuracy: accuracy } : prev));
                }

                if (accuracy > limit) return; // belum cukup meyakinkan, tunggu fix berikutnya

                stop();
                if (isWithinSTMI(latitude, longitude)) {
                    setState({ status: "verified", location: { lat: latitude, lng: longitude, accuracy } });
                } else {
                    setState({ status: "outside", distanceKnown: true });
                }
            },
            (error) => {
                stop();
                if (error.code === error.PERMISSION_DENIED) {
                    setState({ status: "denied" });
                } else {
                    setState({
                        status: "unavailable",
                        reason: "Sinyal lokasi tidak tertangkap. Coba dekati jendela atau area terbuka.",
                    });
                }
            },
            { enableHighAccuracy: true, timeout: LOCATION_TIMEOUT_MS, maximumAge: 0 }
        );

        return stop;
    }, [geofencingOn, attempt]);

    const retry = () => {
        setState({ status: "checking", bestAccuracy: null });
        setAttempt((n) => n + 1);
    };

    // Geofencing dimatikan: gerbang tidak berlaku, form terbuka apa adanya.
    if (!geofencingOn) {
        return <VerifiedLocationContext.Provider value={null}>{children}</VerifiedLocationContext.Provider>;
    }

    if (state.status === "verified") {
        return (
            <VerifiedLocationContext.Provider value={state.location}>
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 mb-4">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>
                        Lokasi terverifikasi — Anda berada di kawasan Politeknik STMI Jakarta
                        <span className="text-emerald-700/70"> (akurasi ±{Math.round(state.location.accuracy)} m)</span>
                    </span>
                </div>
                {children}
            </VerifiedLocationContext.Provider>
        );
    }

    return <GateBlocked state={state} onRetry={retry} />;
}

function GateBlocked({ state, onRetry }: { state: Exclude<GateState, { status: "verified" }>; onRetry: () => void }) {
    if (state.status === "checking") {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-500" />
                <h2 className="text-base font-semibold text-slate-900">Memverifikasi lokasi Anda</h2>
                <p className="mt-1.5 text-sm text-slate-500">
                    Pelaporan hanya dapat dilakukan dari dalam kawasan kampus. Mohon izinkan akses lokasi.
                </p>
                {state.bestAccuracy !== null && (
                    <p className="mt-3 text-xs text-slate-400">
                        Menajamkan sinyal… akurasi saat ini ±{Math.round(state.bestAccuracy)} m
                    </p>
                )}
            </div>
        );
    }

    const copy = {
        outside: {
            icon: Ban,
            tone: "text-red-600",
            box: "border-red-200 bg-red-50",
            title: "Anda berada di luar kawasan kampus",
            body: `Form pelaporan hanya terbuka dalam radius ${STMI_RADIUS_METERS} m dari Politeknik STMI Jakarta.`,
        },
        denied: {
            icon: ShieldAlert,
            tone: "text-amber-600",
            box: "border-amber-200 bg-amber-50",
            title: "Izin lokasi ditolak",
            body: "Verifikasi lokasi wajib untuk melapor. Aktifkan izin lokasi untuk situs ini di pengaturan browser, lalu coba lagi.",
        },
        unavailable: {
            icon: MapPin,
            tone: "text-slate-600",
            box: "border-slate-200 bg-slate-50",
            title: "Lokasi belum dapat dipastikan",
            body: state.status === "unavailable" ? state.reason : "",
        },
    }[state.status];

    const Icon = copy.icon;

    return (
        <div className={`rounded-2xl border p-8 text-center ${copy.box}`}>
            <Icon className={`mx-auto mb-4 h-10 w-10 ${copy.tone}`} />
            <h2 className="text-base font-semibold text-slate-900">{copy.title}</h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">{copy.body}</p>

            <Button onClick={onRetry} className="mt-5">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Coba Verifikasi Lagi
            </Button>
        </div>
    );
}
