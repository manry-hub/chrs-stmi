"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";

import { useRouter } from "next/navigation";
import type { SubmitReportInput as ReportInput } from "@/lib/validations/report";
import { submitReport } from "@/actions/reports/submitReport";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Textarea";
import { Label } from "../ui/Label";
import { ImagePreview } from "./ImagePreview";
import { LocationPicker } from "./LocationPicker";
import { ROUTES } from "@/constants";
import toast from "react-hot-toast";

type FormInput = Omit<ReportInput, "imageUrl"> & { image?: File };

export function ReportSubmitForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: async (values) => {
      const errs: Record<string, { type: string; message: string }> = {};

      // Image is now optional, so no mandatory check here

      // Validate other fields via Zod (skip imageUrl since we haven't uploaded yet)
      if (!values.description || values.description.length < 10) {
        errs.description = { type: "minLength", message: "Deskripsi minimal 10 karakter" };
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

  const onSubmit = async (data: FormInput) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let imageUrl: string | undefined = undefined;

      // 1. Upload Image to Blob if exist
      if (data.image) {
        const formData = new FormData();
        formData.append("file", data.image);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Gagal mengunggah gambar");
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      // 2. Submit to Server Action (which writes to Firestore)
      const res = await submitReport({
        ...data,
        imageUrl,
        image: undefined, // remove file from payload
      });

      if (!res.success) throw new Error("Gagal mengirim laporan");

      toast.success("Laporan berhasil dikirim!");
      router.push(ROUTES.DASHBOARD_REPORTS);
      router.refresh();
    } catch (err) {
      console.error(err);
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
