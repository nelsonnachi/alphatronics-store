// ============================================================
// ORDER STATUS
// ============================================================

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "failed";

// ============================================================
// PAYMENT STATUS
// ============================================================

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

// ============================================================
// PAYMENT METHOD
// ============================================================

export type PaymentMethod = "card" | "bank_transfer" | "cash_on_delivery";

// ============================================================
// ADMIN ORDER QUERY
// ============================================================

export interface AdminOrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

// ============================================================
// CUSTOMER
// ============================================================

export interface OrderCustomer {
  id: string;

  firstName: string | null;

  lastName: string | null;

  email: string;

  phone: string | null;

  imageUrl: string | null;
}

// ============================================================
// ORDER PRODUCT
// ============================================================

export interface OrderProduct {
  id: string;

  name: string;

  slug: string;

  sku: string;
}

// ============================================================
// ORDER VARIANT
// ============================================================

export interface OrderVariant {
  id: string;

  name: string;

  sku: string;

  attributes: Record<string, string>;
}

// ============================================================
// BASE ORDER ITEM
// ============================================================
//
// This is what the database order item itself contains.
// ============================================================

export interface BaseOrderItem {
  id: string;

  orderId: string;

  productId: string;

  variantId: string | null;

  productName: string;

  variantName: string | null;

  sku: string;

  imageUrl: string | null;

  unitPrice: string;

  quantity: number;

  subtotal: string;
}

// ============================================================
// ADMIN ORDER LIST ITEM
// ============================================================
//
// The list endpoint only returns the order item itself.
// It does NOT include product or variant relations.
// ============================================================

export type AdminOrderListItem = BaseOrderItem;

// ============================================================
// ADMIN ORDER DETAIL ITEM
// ============================================================
//
// The detail endpoint includes product + variant.
// ============================================================

export interface AdminOrderDetailItem extends BaseOrderItem {
  product: OrderProduct | null;

  variant: OrderVariant | null;
}

// ============================================================
// PAYMENT
// ============================================================

export interface OrderPayment {
  id: string;

  provider: string;

  providerPaymentId: string | null;

  amount: string;

  currency: string;

  status: PaymentStatus;

  method: string;

  rawResponse?: unknown;

  paidAt: string | null;

  failedAt: string | null;

  createdAt: string;

  updatedAt?: string;
}

// ============================================================
// ADDRESS
// ============================================================

export interface OrderAddress {
  id: string;

  userId: string | null;

  addressLine1: string;

  addressLine2: string | null;

  city: string;

  state: string;

  postalCode: string;

  country: string;

  [key: string]: unknown;
}

// ============================================================
// ADDRESS SNAPSHOT
// ============================================================

export interface OrderAddressSnapshot {
  id: string;

  orderId: string;

  type: "shipping" | "billing";

  fullName: string;

  phone: string;

  addressLine1: string;

  addressLine2: string | null;

  city: string;

  state: string;

  postalCode: string;

  country: string;
}

// ============================================================
// COUPON
// ============================================================

export interface OrderCoupon {
  id: string;

  code: string;

  discountType: string;

  discountValue: string;
}

// ============================================================
// BASE ORDER
// ============================================================

export interface BaseOrder {
  id: string;

  orderNumber: string;

  userId: string;

  status: OrderStatus;

  subtotal: string;

  shippingCost: string;

  tax: string;

  discount: string;

  total: string;

  currency: string;

  couponId: string | null;

  paymentStatus: PaymentStatus;

  paymentMethod: PaymentMethod;

  paidAt: string | null;

  shippingAddressId: string | null;

  billingAddressId: string | null;

  customerNote: string | null;

  adminNote: string | null;

  trackingNumber: string | null;

  carrier: string | null;

  placedAt: string;

  shippedAt: string | null;

  deliveredAt: string | null;

  cancelledAt: string | null;

  createdAt: string;

  updatedAt: string;
}

// ============================================================
// ADMIN ORDER LIST
// ============================================================

export interface AdminOrder extends BaseOrder {
  user: OrderCustomer | null;

  items: AdminOrderListItem[];

  payments: OrderPayment[];
}

// ============================================================
// ADMIN ORDER DETAILS
// ============================================================

export interface AdminOrderDetails extends BaseOrder {
  user:
    | (OrderCustomer & {
        clerkId: string;

        role: string;

        isBanned: boolean;

        createdAt: string;
      })
    | null;

  items: AdminOrderDetailItem[];

  payments: OrderPayment[];

  shippingAddress: OrderAddress | null;

  billingAddress: OrderAddress | null;

  addressSnapshots: OrderAddressSnapshot[];

  coupon: OrderCoupon | null;
}

// ============================================================
// PAGINATION
// ============================================================

export interface OrderPagination {
  page: number;

  limit: number;

  total: number;

  totalPages: number;
}

// ============================================================
// ADMIN ORDERS RESPONSE
// ============================================================

export interface AdminOrdersResponse {
  success: boolean;

  data: AdminOrder[];

  pagination: OrderPagination;
}

// ============================================================
// ADMIN ORDER DETAILS RESPONSE
// ============================================================

export interface AdminOrderResponse {
  success: boolean;

  data: AdminOrderDetails;
}

// ============================================================
// UPDATE ORDER INPUT
// ============================================================
//
// Your backend requires `status` in every PATCH request.
// ============================================================

export interface UpdateAdminOrderInput {
  status: OrderStatus;

  trackingNumber?: string;

  carrier?: string;

  adminNote?: string;
}

// ============================================================
// UPDATE ORDER RESPONSE
// ============================================================

export interface UpdateAdminOrderResponse {
  success: boolean;

  data: BaseOrder;

  message?: string;
}

// ============================================================
// REFUND INPUT
// ============================================================

export interface RefundOrderInput {
  amount?: number;

  reason?: string;

  customerNote?: string;

  merchantNote?: string;
}

// ============================================================
// REFUND RESPONSE
// ============================================================

export interface RefundOrderResponse {
  success: boolean;

  data: Record<string, unknown>;

  message: string;
}
