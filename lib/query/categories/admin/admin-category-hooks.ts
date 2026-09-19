import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./admin-category-api";

import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./admin-category-types";

import { categoryKeys } from "../category-keys";

// ============================================================
// GET ADMIN CATEGORIES
// ============================================================

export function useAdminCategories() {
  return useQuery({
    queryKey: categoryKeys.adminList(),

    queryFn: getAdminCategories,
  });
}

// ============================================================
// CREATE CATEGORY
// ============================================================

export function useCreateCategory() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateCategoryInput,
    ) =>
      createCategory(data),

    onSuccess: () => {
      // Refresh admin categories
      queryClient.invalidateQueries({
        queryKey: categoryKeys.adminAll,
      });

      // Refresh customer categories
      queryClient.invalidateQueries({
        queryKey: categoryKeys.all,
      });
    },
  });
}

// ============================================================
// UPDATE CATEGORY
// ============================================================

export function useUpdateCategory() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      slug,
      data,
    }: {
      slug: string;
      data: UpdateCategoryInput;
    }) =>
      updateCategory(
        slug,
        data,
      ),

    onSuccess: (_, variables) => {
      // Refresh admin categories
      queryClient.invalidateQueries({
        queryKey: categoryKeys.adminAll,
      });

      // Refresh public category lists
      queryClient.invalidateQueries({
        queryKey: categoryKeys.all,
      });

      // Refresh this category's public detail
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(
          variables.slug,
        ),
      });
    },
  });
}

// ============================================================
// DELETE CATEGORY
// ============================================================

export function useDeleteCategory() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      slug: string,
    ) =>
      deleteCategory(slug),

    onSuccess: (_, slug) => {
      // Refresh admin categories
      queryClient.invalidateQueries({
        queryKey: categoryKeys.adminAll,
      });

      // Refresh public categories
      queryClient.invalidateQueries({
        queryKey: categoryKeys.all,
      });

      // Refresh category detail
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(
          slug,
        ),
      });
    },
  });
}