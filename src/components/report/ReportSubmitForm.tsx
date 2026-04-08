"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { reportSchema, ReportInput } from "@/lib/validations/report";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Textarea";
import { Label } from "../ui/Label";
import { ImagePreview } from "./ImagePreview";
import { LocationPicker } from "./LocationPicker";
import { ROUTES } from "@/constants";

export function ReportSubmitForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
  });

  const onSubmit = async (data: ReportInput) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Upload Image to Blob
      const formData = new FormData();
      formData.append("file", data.image);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Gagal mengunggah gambar");
      const { url: imageUrl } = await uploadRes.json();

      // 2. Submit to Server Action (which writes to Firestore)
      // For now we assume we have an action submitReport
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          imageUrl,
          image: undefined, // remove file from payload
        }),
      });

      if (!res.ok) throw new Error("Gagal mengirim laporan");

      router.push(ROUTES.DASHBOARD_REPORTS);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "Terjadi kesalahan saat mengirim laporan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-slate-100">
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Foto Kejadian</Label>
          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <ImagePreview
                onImageSelected={field.onChange}
                error={errors.image?.message as string}
              />
            )}
          />
        </div>

        <div>
          <Label htmlFor="description" className="mb-2 block">Deskripsi Hazard</Label>
          <Textarea 
            id="description" 
            placeholder="Jelaskan bahaya apa yang Anda temukan secara detail..." 
            {...register("description")}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <LocationPicker
                onLocationChange={field.onChange}
                error={errors.location?.message as string}
                nameError={errors.location?.name?.message as string}
              />
            )}
          />
        </div>

        <div>
          <Label htmlFor="additionalMessage" className="mb-2 block">Pesan Tambahan (Opsional)</Label>
          <Textarea 
            id="additionalMessage" 
            placeholder="Informasi tambahan lainnya..." 
            {...register("additionalMessage")}
            className="min-h-[60px]"
          />
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {submitError}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Mengirim Laporan..." : "Kirim Laporan"}
      </Button>
    </form>
  );
}
