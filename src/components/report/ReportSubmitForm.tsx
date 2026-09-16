"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";

import { useRouter } from "next/navigation";
import type { SubmitReportInput as ReportInput } from "@/lib/validations/report";
import { submitReport } from "@/actions/reports/submitReport";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Combobox } from "../ui/Combobox";
import { Label } from "../ui/Label";
import { ImagePreview } from "./ImagePreview";
import { LocationPicker } from "./LocationPicker";
import { ROUTES } from "@/constants";
import toast from "react-hot-toast";
import { LocationDocument, HazardTypeDocument } from "@/types";
import { isWithinSTMI } from "@/lib/utils/geofence";
import { getDeviceId, getSavedReporterName, saveReporterName } from "@/lib/deviceId";
import { uploadReportImage } from "@/lib/uploadImage";

type FormInput = Omit<ReportInput, "imageUrl" | "deviceId"> & { image?: File };

interface ReportSubmitFormProps {
    locations?: LocationDocument[];
    hazardTypes?: HazardTypeDocument[];
    initialLocationId?: string;
    isGeofenceEnabled?: boolean;
}

export function ReportSubmitForm({ locations = [], hazardTypes = [], initialLocationId, isGeofenceEnabled }: ReportSubmitFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const router = useRouter();

    const hazardOptions = hazardTypes.map(h => ({ value: h.name, label: h.name }));

    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset,
        formState: { errors },
    } = useForm<FormInput>({
        resolver: async (values) => {
            const errs: Record<string, { type: string; message: string }> = {};

            if (!values.reporterName || values.reporterName.trim().length < 3) {
                errs.reporterName = { type: "required", message: "Nama pelapor minimal 3 karakter" };
            }

            if (!values.image) {
                errs.image = { type: "required", message: "Foto kejadian wajib diunggah" };
            }

            // Validate other fields via Zod
            if (!values.description) {
                errs.description = { type: "required", message: "Jenis sumber potensi bahaya wajib diisi" };
            }

            if (!values.location?.name || values.location.name.length < 1) {
                errs["location.name"] = { type: "required", message: "Nama lokasi wajib diisi" };
                errs.location = { type: "required", message: "Lokasi wajib diisi" };
            }

            return {
                values: Object.keys(errs).length === 0 ? values : {},
                errors: errs,
            };
        },
    });

    // Prefill setelah mount, bukan lewat defaultValues, agar markup server dan
    // klien tetap sama saat hidrasi.
    useEffect(() => {
        const saved = getSavedReporterName();
        if (saved) setValue("reporterName", saved);
    }, [setValue]);

    const onSubmit = async (data: FormInput) => {
        setIsSubmitting(true);
        setSubmitError(null);

        const draftId = crypto.randomUUID();
        const deviceId = getDeviceId();
        const reporterName = data.reporterName.trim();
        saveReporterName(reporterName);

        try {
            const rawEnv = process.env.NEXT_PUBLIC_ENABLE_GEOFENCING;
            const envValueFallback = (rawEnv || "").replace(/['"]/g, "").trim().toLowerCase();
            const geofenceActive = isGeofenceEnabled ?? (envValueFallback === "true");
            
            let lat = 0;
            let lng = 0;

            if (geofenceActive) {
                // 1. Dapatkan GPS otomatis
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    if (!navigator.geolocation) {
                        reject(new Error("Browser Anda tidak mendukung geolokasi."));
                    } else {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 0,
                        });
                    }
                }).catch(() => {
                    throw new Error("Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin diberikan.");
                });

                lat = position.coords.latitude;
                lng = position.coords.longitude;

                // 2. Cek Geofence
                if (!isWithinSTMI(lat, lng)) {
                    throw new Error("Laporan ditolak: Anda berada di luar kawasan Politeknik STMI Jakarta.");
                }
            }

            const locationData = data.location as any;
                const draftPayload = {
                id: draftId,
                formData: {
                    reporterName,
                    deviceId,
                    description: data.description,
                    additionalMessage: data.additionalMessage,
                    locationId: locationData.locationId,
                    assignedAdminId: locationData.assignedAdminId,
                    location: {
                        name: locationData.name,
                        lat,
                        lng,
                    }
                },
                imageFile: data.image as File
            };

            // Check online status before upload/submit
            if (!navigator.onLine) {
                const { saveDraft } = await import("@/lib/offlineSync");
                await saveDraft(draftPayload);
                toast.success("Anda sedang offline. Laporan disimpan ke Draft dan akan otomatis dikirim saat online.");
                reset({ reporterName });
                router.refresh();
                return;
            }

            // 3. Upload Image
            let imageUrl: string | undefined = undefined;
            if (data.image) {
                imageUrl = await uploadReportImage(data.image, deviceId);
            }

            // 4. Submit to Server Action
            const payload = {
                ...data,
                reporterName,
                deviceId,
                draftId,
                location: {
                    name: locationData.name,
                    lat,
                    lng
                },
                locationId: locationData.locationId,
                assignedAdminId: locationData.assignedAdminId,
                imageUrl,
                image: undefined, // remove file from payload
            };

            const res = await submitReport(payload);

            if (!res.success) throw new Error("Gagal mengirim laporan");

            toast.success("Laporan berhasil dikirim!");
            router.push(`${ROUTES.REPORTS}/${res.reportId}`);
        } catch (err: any) {
            console.error(err);
            // Catch TypeError which is usually fetch network error
            if (err instanceof TypeError && err.message === "Failed to fetch") {
                const { saveDraft } = await import("@/lib/offlineSync");
                const locationData = data.location as any;
                await saveDraft({
                    id: draftId,
                    formData: {
                        reporterName,
                        deviceId,
                        description: data.description,
                        additionalMessage: data.additionalMessage,
                        locationId: locationData.locationId,
                        assignedAdminId: locationData.assignedAdminId,
                        location: {
                            name: locationData.name,
                        }
                    },
                    imageFile: data.image as File
                });
                toast.success("Koneksi bermasalah. Laporan disimpan ke Draft dan akan otomatis dikirim saat online.");
                reset({ reporterName });
                router.refresh();
                return;
            }

            const msg = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
            setSubmitError(msg);
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-slate-100">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="reporterName" className="mb-2 block">
                        Nama Pelapor
                    </Label>
                    <Input
                        id="reporterName"
                        placeholder="Nama lengkap Anda"
                        autoComplete="name"
                        {...register("reporterName")}
                        error={errors.reporterName?.message as string}
                    />
                </div>

                <div>
                    <Label className="mb-2 block">Foto Kejadian</Label>
                    <Controller
                        name="image"
                        control={control}
                        render={({ field }) => <ImagePreview onImageSelected={field.onChange} error={errors.image?.message as string} />}
                    />
                </div>

                <div>
                    <Label htmlFor="description" className="mb-2 block">
                        Jenis Sumber Potensi Bahaya
                    </Label>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <Combobox
                                options={hazardOptions}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Ketik atau pilih jenis bahaya..."
                                error={errors.description?.message}
                            />
                        )}
                    />
                </div>
                <div>
                    <Label htmlFor="additionalMessage" className="mb-2 block">
                        Informasi Tambahan (Opsional)
                    </Label>
                    <Textarea
                        id="additionalMessage"
                        placeholder="Keterangan tambahan terkait laporan..."
                        {...register("additionalMessage")}
                        className="min-h-[60px]"
                    />
                </div>
                <div>
                    <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                            <LocationPicker
                                locations={locations}
                                initialLocationId={initialLocationId}
                                onLocationChange={(locData) => {
                                    field.onChange(locData);
                                }}
                                error={errors.location?.message as string}
                                nameError={errors.location?.name?.message as string}
                            />
                        )}
                    />
                </div>
            </div>

            {submitError && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{submitError}</div>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Mengirim Laporan..." : "Kirim Laporan"}
            </Button>
        </form>
    );
}
