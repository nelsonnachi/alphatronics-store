// ============================================================
// USER ROLE
// ============================================================

export type UserRole =
  | "customer"
  | "admin"
  | "super_admin";

// ============================================================
// USER STATUS
// ============================================================

export type UserStatus =
  | "active"
  | "banned";

// ============================================================
// BASIC USER
// ============================================================

export type User = {
  id: string;

  clerkId: string;

  email: string;

  firstName: string | null;

  lastName: string | null;

  imageUrl: string | null;

  phone: string | null;

  role: UserRole;

  isBanned: boolean;

  createdAt: string;

  updatedAt: string;
};

// ============================================================
// ADMIN USER LIST ITEM
// ============================================================

export type AdminUser = User & {
  totalOrders: number;

  totalSpent: number;
};

// ============================================================
// ADMIN USER LIST QUERY
// ============================================================

export type AdminUserQueryParams = {
  page?: number;

  limit?: number;

  search?: string;

  status?:
    | "all"
    | UserStatus;

  role?:
    | "all"
    | UserRole;

  sort?:
    | "newest"
    | "oldest"
    | "name_asc"
    | "name_desc";
};

// ============================================================
// ADMIN USER UPDATE
// ============================================================

export type UpdateAdminUserInput = {
  isBanned?: boolean;

  role?: "customer" | "admin";
};

// ============================================================
// ADMIN USERS RESPONSE
// ============================================================

export type AdminUsersResponse = {
  success: true;

  data: AdminUser[];

  pagination: {
    page: number;

    limit: number;

    total: number;

    totalPages: number;
  };
};

// ============================================================
// ADDRESS
// ============================================================

export type UserAddress = {
  id: string;

  firstName: string;

  lastName: string;

  addressLine1: string;

  addressLine2: string | null;

  city: string;

  state: string;

  postalCode: string | null;

  country: string;

  isDefault: boolean;
};

// ============================================================
// CUSTOMER ORDER
// ============================================================

export type AdminUserOrder = {
  id: string;

  orderNumber: string;

  status: string;

  paymentStatus: string;

  total: string | number;

  currency: string;

  placedAt: string;
};

// ============================================================
// CUSTOMER DETAILS
// ============================================================

export type AdminUserDetails = {
  customer: User;

  addresses: UserAddress[];

  orders: {
    recent: AdminUserOrder[];

    totalOrders: number;

    totalSpent: number;
  };

  payments: unknown[];

  refunds: {
    recent: unknown[];
  };

  cart: unknown | null;
};

// ============================================================
// CUSTOMER DETAILS RESPONSE
// ============================================================

export type AdminUserDetailsResponse = {
  success: true;

  data: AdminUserDetails;
};

// ============================================================
// CUSTOMER ORDERS QUERY
// ============================================================

export type UserOrderQueryParams = {
  page?: number;

  limit?: number;

  status?: string;
};

// ============================================================
// CUSTOMER ORDERS RESPONSE
// ============================================================

export type UserOrdersResponse = {
  success: true;

  data: {
    id: string;

    orderNumber: string;

    subtotal: string | number;

    shippingCost: string | number;

    tax: string | number;

    discount: string | number;

    total: string | number;

    currency: string;

    status: string;

    paymentStatus: string;

    paymentMethod: string;

    paidAt: string | null;

    trackingNumber: string | null;

    carrier: string | null;

    placedAt: string;

    shippedAt: string | null;

    deliveredAt: string | null;

    cancelledAt: string | null;
  }[];

  pagination: {
    page: number;

    limit: number;

    total: number;

    totalPages: number;
  };
};

// ============================================================
// CURRENT USER RESPONSE
// ============================================================

export type CurrentUserResponse = {
  success: true;

  data: User;
};