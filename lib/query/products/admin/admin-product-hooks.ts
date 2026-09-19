import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAdminProducts,
  getAdminProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./admin-product-api";

import type {
  AdminProductQueryParams,
} from "./admin-product-types";

import { productKeys } from "../product-keys";

// ============================================================
// GET ADMIN PRODUCTS
// ============================================================

export function useAdminProducts(
  params: AdminProductQueryParams = {},
) {
  return useQuery({
    queryKey: productKeys.adminList(params),

    queryFn: () => getAdminProducts(params),
  });
}

// ============================================================
// GET SINGLE ADMIN PRODUCT
// ============================================================

export function useAdminProduct(
  slug: string,
) {
  return useQuery({
    queryKey: productKeys.adminDetail(slug),

    queryFn: () => getAdminProduct(slug),

    enabled: Boolean(slug),
  });
}

// ============================================================
// CREATE PRODUCT
// ============================================================

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      createProduct(formData),

    onSuccess: () => {
      // Refresh admin product lists
      queryClient.invalidateQueries({
        queryKey: productKeys.adminAll,
      });

      // Refresh public product lists
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
      });
    },
  });
}

// ============================================================
// UPDATE PRODUCT
// ============================================================

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      slug,
      formData,
    }: {
      slug: string;
      formData: FormData;
    }) => updateProduct(slug, formData),

    onSuccess: (_, variables) => {
      // Refresh admin product lists
      queryClient.invalidateQueries({
        queryKey: productKeys.adminAll,
      });

      // Refresh this specific admin product
      queryClient.invalidateQueries({
        queryKey: productKeys.adminDetail(
          variables.slug,
        ),
      });

      // Refresh public product data
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
      });
    },
  });
}

// ============================================================
// DELETE PRODUCT
// ============================================================

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) =>
      deleteProduct(slug),

    onSuccess: () => {
      // Refresh admin product lists
      queryClient.invalidateQueries({
        queryKey: productKeys.adminAll,
      });

      // Refresh public product lists
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
      });
    },
  });
}