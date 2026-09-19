import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../category-types";

// ============================================================
// ADMIN CATEGORY LIST RESPONSE
// ============================================================

export interface AdminCategoriesResponse {
  success: boolean;
  data: Category[];
}

// ============================================================
// CREATE CATEGORY RESPONSE
// ============================================================

export interface CreateCategoryResponse {
  success: boolean;
  data: Category;
}

// ============================================================
// UPDATE CATEGORY RESPONSE
// ============================================================

export interface UpdateCategoryResponse {
  success: boolean;
  data: Category;
}

// ============================================================
// DELETE CATEGORY RESPONSE
// ============================================================

export interface DeleteCategoryResponse {
  success: boolean;
  data: {
    message: string;
  };
}

// Re-export inputs for convenience
export type {
  CreateCategoryInput,
  UpdateCategoryInput,
};