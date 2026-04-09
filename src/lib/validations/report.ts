import { z } from "zod";

export const submitReportSchema = z.object({
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  location: z.object({
    name: z.string().min(1, "Nama lokasi wajib diisi"),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  additionalMessage: z.string().optional(),
  imageUrl: z.any().optional(),
});

export type SubmitReportInput = z.infer<typeof submitReportSchema>;
