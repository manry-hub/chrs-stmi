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
import { getDeviceId, getSavedReporterName, saveReporterName } from "@/lib/deviceId";
import { useVerifiedLocation } from "./LocationGate";
import { uploadReportImage } from "@/lib/uploadImage";
import type { OfflineDraftInput } from "@/lib/offlineSync";

type FormInput = Omit<ReportInput, "imageUrl" | "deviceId"> & { image?: File };

interface ReportSubmitFormProps {
    locations?: LocationDocument[];
    hazardTypes?: HazardTypeDocument[];
    initialLocationId?: string;
}

export function ReportSubmitForm({ locations = [], hazardTypes = [], initialLocationId }: ReportSubmitFormProps) {
    const verifiedLocation = useVerifiedLocation();
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

        // Dipakai ulang oleh jalur offline maupun jalur koneksi putus di tengah
        // pengiriman. Sebelumnya kedua jalur membangun draft sendiri-sendiri dan
        // yang satu kehilangan koordinat.
        let draftPayload: OfflineDraftInput | null = null;

        try {
            // Koordinat berasal dari LocationGate, yang sudah memastikan posisi
            // berada di kawasan kampus sebelum form ini dirender. Bernilai null
            // hanya ketika geofencing dimatikan.
            const lat = verifiedLocation?.lat;
            const lng = verifiedLocation?.lng;
            const accuracy = verifiedLocation?.accuracy;

            const locationData = data.location as any;
            draftPayload = {
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
                        accuracy,
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
                    lng,
                    accuracy,
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
            // Catch TypeError which is usually fetch network error.
            // draftPayload bisa masih null bila kegagalan terjadi sebelum draft
            // terbentuk; dalam kasus itu jatuh ke penanganan error biasa.
            if (err instanceof TypeError && err.message === "Failed to fetch" && draftPayload) {
                const { saveDraft } = await import("@/lib/offlineSync");
                await saveDraft(draftPayload);
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
