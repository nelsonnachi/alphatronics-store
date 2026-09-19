import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAdminInventory,
  getAdminProductInventory,
  updateProductInventory,
  updateVariantInventory,
  getAdminInventoryMovements,
} from "./admin-inventory-api";

import type {
  AdminInventoryQueryParams,
  AdminInventoryMovementQueryParams,
  UpdateInventoryInput,
} from "./admin-inventory-types";

import { adminInventoryKeys } from "./admin-inventory-keys";

// ============================================================
// GET ADMIN INVENTORY
// ============================================================

export function useAdminInventory(
  params: AdminInventoryQueryParams = {},
) {
  return useQuery({
    queryKey: adminInventoryKeys.list(params),

    queryFn: () => getAdminInventory(params),
  });
}

// ============================================================
// GET SINGLE PRODUCT INVENTORY
// ============================================================

export function useAdminProductInventory(
  productId: string,
) {
  return useQuery({
    queryKey: adminInventoryKeys.detail(productId),

    queryFn: () =>
      getAdminProductInventory(productId),

    enabled: Boolean(productId),
  });
}

// ============================================================
// UPDATE PRODUCT INVENTORY
// ============================================================

export function useUpdateProductInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: UpdateInventoryInput;
    }) =>
      updateProductInventory(
        productId,
        data,
      ),

    onSuccess: (_, variables) => {
      // Refresh inventory lists
      queryClient.invalidateQueries({
        queryKey: adminInventoryKeys.lists(),
      });

      // Refresh this product's inventory
      queryClient.invalidateQueries({
        queryKey: adminInventoryKeys.detail(
          variables.productId,
        ),
      });

      // Inventory movement history may also
      // have changed.
      queryClient.invalidateQueries({
        queryKey: adminInventoryKeys.movements(),
      });
    },
  });
}

// ============================================================
// UPDATE VARIANT INVENTORY
// ============================================================

export function useUpdateVariantInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      data,
    }: {
      productId: string;
      variantId: string;
      data: UpdateInventoryInput;
    }) =>
      updateVariantInventory(
        productId,
        variantId,
        data,
      ),

    onSuccess: (_, variables) => {
      // Refresh inventory list
      queryClient.invalidateQueries({
        queryKey: adminInventoryKeys.lists(),
      });

      // Refresh product inventory detail
      queryClient.invalidateQueries({
        queryKey: adminInventoryKeys.detail(
          variables.productId,
        ),
      });

      // Refresh movement history
      queryClient.invalidateQueries({
        queryKey: adminInventoryKeys.movements(),
      });
    },
  });
}

// ============================================================
// GET INVENTORY MOVEMENTS
// ============================================================

export function useAdminInventoryMovements(
  params: AdminInventoryMovementQueryParams = {},
) {
  return useQuery({
    queryKey:
      adminInventoryKeys.movementList(params),

    queryFn: () =>
      getAdminInventoryMovements(params),
  });
}