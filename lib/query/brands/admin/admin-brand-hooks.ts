import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAdminBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "./admin-brand-api";

import type {
  CreateBrandInput,
  UpdateBrandInput,
} from "./admin-brand-types";

import { brandKeys } from "../brand-keys";

// ============================================================
// GET ADMIN BRANDS
// ============================================================

export function useAdminBrands() {
  return useQuery({
    queryKey: brandKeys.adminList(),

    queryFn: getAdminBrands,
  });
}

// ============================================================
// CREATE BRAND
// ============================================================

export function useCreateBrand() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateBrandInput,
    ) =>
      createBrand(data),

    onSuccess: () => {
      // Refresh admin brands

      queryClient.invalidateQueries({
        queryKey: brandKeys.adminAll,
      });

      // Refresh public brands

      queryClient.invalidateQueries({
        queryKey: brandKeys.all,
      });
    },
  });
}

// ============================================================
// UPDATE BRAND
// ============================================================

export function useUpdateBrand() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      slug,
      data,
    }: {
      slug: string;
      data: UpdateBrandInput;
    }) =>
      updateBrand(
        slug,
        data,
      ),

    onSuccess: (_, variables) => {
      // Refresh admin brands

      queryClient.invalidateQueries({
        queryKey: brandKeys.adminAll,
      });

      // Refresh public brands

      queryClient.invalidateQueries({
        queryKey: brandKeys.all,
      });

      // Refresh the specific public brand

      queryClient.invalidateQueries({
        queryKey: brandKeys.detail(
          variables.slug,
        ),
      });
    },
  });
}

// ============================================================
// DELETE / DEACTIVATE BRAND
// ============================================================

export function useDeleteBrand() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      slug: string,
    ) =>
      deleteBrand(slug),

    onSuccess: (_, slug) => {
      // Refresh admin brands

      queryClient.invalidateQueries({
        queryKey: brandKeys.adminAll,
      });

      // Refresh public brands

      queryClient.invalidateQueries({
        queryKey: brandKeys.all,
      });

      // Refresh the specific public brand

      queryClient.invalidateQueries({
        queryKey: brandKeys.detail(
          slug,
        ),
      });
    },
  });
}