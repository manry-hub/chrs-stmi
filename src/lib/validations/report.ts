import { z } from "zod";

export const reportSchema = z.object({
  image: z.any().refine((file) => file instanceof File, "File gambar wajib diunggah"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  location: z.object({
    name: z.string().min(1, "Lokasi wajib diisi"),
    lat: z.number(),
    lng: z.number(),
  }),
  additionalMessage: z.string().optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;
