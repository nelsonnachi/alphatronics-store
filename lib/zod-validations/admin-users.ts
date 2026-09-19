// lib/zod-validations/admin-users.ts

import { z } from "zod";

import { orderStatusEnum } from "@/db/schema";

// ============================================================
// ADMIN USER LIST
// ============================================================

export const adminUserQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().optional(),

  status: z.enum(["active", "banned"]).optional(),

  role: z.enum(["customer", "admin", "super_admin"]).optional(),

  sort: z.enum(["newest", "oldest", "name_asc", "name_desc"]).default("newest"),
});

// ============================================================
// ADMIN USER UPDATE
// ============================================================
//
// Everyday admin user management does NOT allow assigning
// super_admin.
//
// Your API has additional server-side protection as well.
//

export const adminUpdateUserSchema = z.object({
  isBanned: z.boolean().optional(),

  role: z.enum(["customer", "admin"]).optional(),
});

// ============================================================
// CURRENT USER UPDATE
// ============================================================
//
// This is intentionally separate from admin updates.
//

export const updateUserSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),

  lastName: z.string().trim().min(1).max(100).optional(),

  phone: z.string().trim().min(6).max(20).optional(),
});

// ============================================================
// SUPER ADMIN ROLE MANAGEMENT
// ============================================================
//
// Keep this separate if you eventually create a dedicated
// super-admin-only endpoint.
//

export const superAdminUpdateUserSchema = z.object({
  role: z.enum(["customer", "admin", "super_admin"]).optional(),
});

// ============================================================
// CUSTOMER ORDER HISTORY
// ============================================================

export const userOrderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  status: z.enum(orderStatusEnum.enumValues).optional(),
});

// ============================================================
// TYPES
// ============================================================

export type AdminUserQuery = z.infer<typeof adminUserQuerySchema>;

export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type SuperAdminUpdateUserInput = z.infer<
  typeof superAdminUpdateUserSchema
>;

export type UserOrderQuery = z.infer<typeof userOrderQuerySchema>;
