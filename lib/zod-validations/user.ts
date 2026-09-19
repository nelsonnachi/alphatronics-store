// lib/zod-validations/user.ts

import { z } from "zod";

// ============================================================
// CURRENT USER PROFILE UPDATE
// ============================================================

export const updateUserSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),

  lastName: z.string().trim().min(1).max(100).optional(),

  phone: z.string().trim().min(6).max(20).optional(),
});

export type UpdateUserValidation = z.infer<typeof updateUserSchema>;
