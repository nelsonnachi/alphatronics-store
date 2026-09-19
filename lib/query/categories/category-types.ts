// ============================================================
// CATEGORY
// ============================================================

export interface Category {
  id: string;
  name: string;
  slug: string;

  description: string | null;

  imageUrl: string | null;

  icon: string | null;

  parentId: string | null;

  displayOrder: number;

  isActive: boolean;

  isFeatured: boolean;

  metaTitle: string | null;

  metaDescription: string | null;

  createdAt: string;

  updatedAt: string;
}

// ============================================================
// CATEGORY TREE
// ============================================================

export interface CategoryTree extends Category {
  children: Category[];
}

// ============================================================
// GET CATEGORIES RESPONSE
// ============================================================

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

// ============================================================
// GET CATEGORY TREE RESPONSE
// ============================================================

export interface CategoryTreeResponse {
  success: boolean;
  data: CategoryTree[];
}

// ============================================================
// GET SINGLE CATEGORY RESPONSE
// ============================================================

export interface CategoryResponse {
  success: boolean;
  data: CategoryTree;
}

// ============================================================
// PUBLIC CATEGORY QUERY PARAMETERS
// ============================================================

export interface CategoryQueryParams {
  featured?: boolean;
  tree?: boolean;
}

// ============================================================
// CREATE CATEGORY INPUT
// ============================================================

export interface CreateCategoryInput {
  name: string;

  slug: string;

  description?: string;

  imageUrl?: string;

  icon?: string;

  parentId?: string | null;

  displayOrder?: number;

  isFeatured?: boolean;

  metaTitle?: string;

  metaDescription?: string;
}

// ============================================================
// UPDATE CATEGORY INPUT
// ============================================================

export interface UpdateCategoryInput {
  name?: string;

  slug?: string;

  description?: string;

  imageUrl?: string;

  icon?: string;

  parentId?: string | null;

  displayOrder?: number;

  isFeatured?: boolean;

  isActive?: boolean;

  metaTitle?: string;

  metaDescription?: string;
}