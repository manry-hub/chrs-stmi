import { z } from "zod";

export const roleSchema = z.enum(["user", "admin", "superadmin"]);

export const userFormSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(8, "Telepon minimal 8 karakter"),
  role: roleSchema,
  password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
});

export const createUserSchema = userFormSchema.extend({
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const updateUserSchema = userFormSchema.omit({ password: true });

export type UserFormInput = z.infer<typeof userFormSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
