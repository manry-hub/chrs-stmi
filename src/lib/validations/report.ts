import { z } from "zod";

export const submitReportSchema = z.object({
  reporterName: z
    .string()
    .trim()
    .min(3, "Nama pelapor minimal 3 karakter")
    .max(60, "Nama pelapor maksimal 60 karakter"),
  description: z.string().min(1, "Jenis sumber potensi bahaya wajib diisi"),
  location: z.object({
    name: z.string().min(1, "Nama lokasi wajib diisi"),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  locationId: z.string().optional(),
  assignedAdminId: z.string().optional(),
  additionalMessage: z.string().optional(),
  imageUrl: z.any().optional(),
  draftId: z.string().optional(),
  deviceId: z.string().optional(),
});

export type SubmitReportInput = z.infer<typeof submitReportSchema>;
