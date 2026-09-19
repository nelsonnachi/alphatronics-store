import { defineRelations } from "drizzle-orm";
import * as schema from "./index";

export const relations = defineRelations(schema, (r) => ({
  // =========================================================
  // USERS
  // =========================================================

  users: {
    addresses: r.many.addresses({
      from: r.users.id,
      to: r.addresses.userId,
    }),

    orders: r.many.orders({
      from: r.users.id,
      to: r.orders.userId,
    }),

    cart: r.one.carts({
      from: r.users.id,
      to: r.carts.userId,
    }),
  },

  // =========================================================
  // CATEGORIES
  // =========================================================

  categories: {
    parent: r.one.categories({
      from: r.categories.parentId,
      to: r.categories.id,
    }),

    children: r.many.categories({
      from: r.categories.id,
      to: r.categories.parentId,
    }),

    products: r.many.products({
      from: r.categories.id,
      to: r.products.categoryId,
    }),
  },

  // =========================================================
  // BRANDS
  // =========================================================

  brands: {
    products: r.many.products({
      from: r.brands.id,
      to: r.products.brandId,
    }),
  },

  // =========================================================
  // PRODUCTS
  // =========================================================

  products: {
    category: r.one.categories({
      from: r.products.categoryId,
      to: r.categories.id,
    }),

    brand: r.one.brands({
      from: r.products.brandId,
      to: r.brands.id,
    }),

    images: r.many.productImages({
      from: r.products.id,
      to: r.productImages.productId,
    }),

    specifications: r.many.productSpecifications({
      from: r.products.id,
      to: r.productSpecifications.productId,
    }),

    variants: r.many.productVariants({
      from: r.products.id,
      to: r.productVariants.productId,
    }),

    cartItems: r.many.cartItems({
      from: r.products.id,
      to: r.cartItems.productId,
    }),

    orderItems: r.many.orderItems({
      from: r.products.id,
      to: r.orderItems.productId,
    }),

    // NEW
    inventoryMovements: r.many.inventoryMovements({
      from: r.products.id,
      to: r.inventoryMovements.productId,
    }),
  },

  // =========================================================
  // PRODUCT IMAGES
  // =========================================================

  productImages: {
    product: r.one.products({
      from: r.productImages.productId,
      to: r.products.id,
    }),
  },

  // =========================================================
  // PRODUCT SPECIFICATIONS
  // =========================================================

  productSpecifications: {
    product: r.one.products({
      from: r.productSpecifications.productId,
      to: r.products.id,
    }),
  },

  // =========================================================
  // PRODUCT VARIANTS
  // =========================================================

  productVariants: {
    product: r.one.products({
      from: r.productVariants.productId,
      to: r.products.id,
    }),

    cartItems: r.many.cartItems({
      from: r.productVariants.id,
      to: r.cartItems.variantId,
    }),

    orderItems: r.many.orderItems({
      from: r.productVariants.id,
      to: r.orderItems.variantId,
    }),

    // NEW
    inventoryMovements: r.many.inventoryMovements({
      from: r.productVariants.id,
      to: r.inventoryMovements.variantId,
    }),
  },

  // =========================================================
  // INVENTORY MOVEMENTS
  // =========================================================

  inventoryMovements: {
    product: r.one.products({
      from: r.inventoryMovements.productId,
      to: r.products.id,
    }),

    variant: r.one.productVariants({
      from: r.inventoryMovements.variantId,
      to: r.productVariants.id,
    }),

    user: r.one.users({
      from: r.inventoryMovements.userId,
      to: r.users.id,
    }),

    order: r.one.orders({
      from: r.inventoryMovements.orderId,
      to: r.orders.id,
    }),
  },

  // =========================================================
  // CARTS
  // =========================================================

  carts: {
    user: r.one.users({
      from: r.carts.userId,
      to: r.users.id,
    }),

    items: r.many.cartItems({
      from: r.carts.id,
      to: r.cartItems.cartId,
    }),
  },

  // =========================================================
  // CART ITEMS
  // =========================================================

  cartItems: {
    cart: r.one.carts({
      from: r.cartItems.cartId,
      to: r.carts.id,
    }),

    product: r.one.products({
      from: r.cartItems.productId,
      to: r.products.id,
    }),

    variant: r.one.productVariants({
      from: r.cartItems.variantId,
      to: r.productVariants.id,
    }),
  },

  // =========================================================
  // ADDRESSES
  // =========================================================

  addresses: {
    user: r.one.users({
      from: r.addresses.userId,
      to: r.users.id,
    }),

    shippingOrders: r.many.orders({
      from: r.addresses.id,
      to: r.orders.shippingAddressId,
      alias: "shippingAddress",
    }),

    billingOrders: r.many.orders({
      from: r.addresses.id,
      to: r.orders.billingAddressId,
      alias: "billingAddress",
    }),
  },

  // =========================================================
  // COUPONS
  // =========================================================

  coupons: {
    orders: r.many.orders({
      from: r.coupons.id,
      to: r.orders.couponId,
    }),
  },

  // =========================================================
  // ORDERS
  // =========================================================

  orders: {
    user: r.one.users({
      from: r.orders.userId,
      to: r.users.id,
    }),

    coupon: r.one.coupons({
      from: r.orders.couponId,
      to: r.coupons.id,
    }),

    shippingAddress: r.one.addresses({
      from: r.orders.shippingAddressId,
      to: r.addresses.id,
      alias: "shippingAddress",
    }),

    billingAddress: r.one.addresses({
      from: r.orders.billingAddressId,
      to: r.addresses.id,
      alias: "billingAddress",
    }),

    addressSnapshots: r.many.orderAddressSnapshots({
      from: r.orders.id,
      to: r.orderAddressSnapshots.orderId,
    }),

    items: r.many.orderItems({
      from: r.orders.id,
      to: r.orderItems.orderId,
    }),

    payments: r.many.payments({
      from: r.orders.id,
      to: r.payments.orderId,
    }),

    refunds: r.many.refunds({
      from: r.orders.id,
      to: r.refunds.orderId,
    }),
  },

  // =========================================================
  // ORDER ADDRESS SNAPSHOTS
  // =========================================================

  orderAddressSnapshots: {
    order: r.one.orders({
      from: r.orderAddressSnapshots.orderId,
      to: r.orders.id,
    }),
  },

  // =========================================================
  // ORDER ITEMS
  // =========================================================

  orderItems: {
    order: r.one.orders({
      from: r.orderItems.orderId,
      to: r.orders.id,
    }),

    product: r.one.products({
      from: r.orderItems.productId,
      to: r.products.id,
    }),

    variant: r.one.productVariants({
      from: r.orderItems.variantId,
      to: r.productVariants.id,
    }),
  },

  // =========================================================
  // PAYMENTS
  // =========================================================

  payments: {
    order: r.one.orders({
      from: r.payments.orderId,
      to: r.orders.id,
    }),

    refunds: r.many.refunds({
      from: r.payments.id,
      to: r.refunds.paymentId,
    }),
  },

  // =========================================================
  // REFUNDS
  // =========================================================

  refunds: {
    payment: r.one.payments({
      from: r.refunds.paymentId,
      to: r.payments.id,
    }),

    order: r.one.orders({
      from: r.refunds.orderId,
      to: r.orders.id,
    }),
  },
}));
