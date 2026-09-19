// app/api/checkout/route.ts

import { NextRequest } from "next/server";

import { and, count, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db/drizzle";

import {
  cartItems,
  coupons,
  orderAddressSnapshots,
  orderItems,
  orders,
  payments,
  productVariants,
  products,
} from "@/db/schema";

import { checkoutSchema } from "@/lib/zod-validations/order";

import { ApiError, handleApiError } from "@/lib/APIs/api-errors";

import { requireUser } from "@/lib/APIs/auth";

import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_RATES,
  TAX_RATE,
  generateOrderNumber,
  generatePaymentReference,
  getPaymentExpirationDate,
} from "@/lib/APIs/helpers-utils";

import { resolveCart } from "@/lib/APIs/cart";

import { getUserAddress } from "@/lib/APIs/address";

import { initializePaystackTransaction } from "@/lib/payments/paystack";

/**
 * ============================================================
 * POST /api/checkout
 * ============================================================
 *
 * Supports:
 *
 * 1. Cash on Delivery
 * 2. Paystack
 *
 * COD:
 * - creates order
 * - creates payment record
 * - deducts stock
 * - consumes coupon
 * - clears cart
 *
 * PAYSTACK:
 * - creates order
 * - creates payment record
 * - reserves stock
 * - initializes Paystack
 * - returns Paystack authorization URL
 *
 * Stock for Paystack is NOT permanently deducted
 * until payment is successfully verified.
 */
export async function POST(req: NextRequest) {
  try {
    // ==========================================================
    // 1. AUTHENTICATE USER
    // ==========================================================

    const user = await requireUser();

    // ==========================================================
    // 2. VALIDATE REQUEST
    // ==========================================================

    const body = await req.json();

    const input = checkoutSchema.parse(body);

    // ==========================================================
    // 3. GET CURRENT CART
    // ==========================================================

    const cart = await resolveCart({
      createIfMissing: false,
    });

    if (!cart) {
      throw new ApiError("Your cart is empty", 400);
    }

    // ==========================================================
    // 4. GENERATE INTERNAL REFERENCES
    // ==========================================================

    const orderNumber = generateOrderNumber();

    const paymentReference = generatePaymentReference(orderNumber);

    // ==========================================================
    // 5. CREATE ORDER
    // ==========================================================

    const checkoutResult = await db.transaction(async (tx) => {
      // ========================================================
      // LOAD CART
      // ========================================================

      const currentCart = await tx.query.carts.findFirst({
        where: {
          id: cart.id,
          userId: user.id,
        },

        with: {
          items: true,
        },
      });

      if (!currentCart || currentCart.items.length === 0) {
        throw new ApiError("Your cart is empty", 400);
      }

      // ========================================================
      // PREPARE ORDER ITEMS
      // ========================================================

      let subtotal = 0;

      const preparedItems: Array<{
        productId: string;
        variantId: string | null;
        productName: string;
        variantName: string | null;
        sku: string;
        imageUrl: string | null;
        unitPrice: number;
        quantity: number;
        lineTotal: number;
      }> = [];

      // ========================================================
      // CHECK EVERY CART ITEM
      // ========================================================

      for (const cartItem of currentCart.items) {
        // ======================================================
        // GET PRODUCT
        // ======================================================

        const product = await tx.query.products.findFirst({
          where: {
            id: cartItem.productId,
          },

          with: {
            images: {
              limit: 1,

              orderBy: {
                position: "asc",
              },
            },
          },
        });

        if (!product || !product.isActive || product.deletedAt !== null) {
          throw new ApiError(
            "A product in your cart is no longer available",
            409,
          );
        }

        // ======================================================
        // DEFAULT PRODUCT INFORMATION
        // ======================================================

        let unitPrice = Number(product.price);

        let availableStock = product.stock - product.reservedStock;

        let variantName: string | null = null;

        let sku = product.sku;

        let imageUrl = product.images[0]?.url ?? null;

        // ======================================================
        // VARIANT
        // ======================================================

        if (cartItem.variantId) {
          const variant = await tx.query.productVariants.findFirst({
            where: {
              id: cartItem.variantId,
              productId: product.id,
            },
          });

          if (!variant || !variant.isActive) {
            throw new ApiError(
              `The selected variant of "${product.name}" is no longer available`,
              409,
            );
          }

          // Variant price overrides product price.
          if (variant.price !== null) {
            unitPrice = Number(variant.price);
          }

          // Variant has its own stock.
          availableStock = variant.stock - variant.reservedStock;

          variantName = variant.name;

          sku = variant.sku;

          // Variant image overrides product image.
          if (variant.imageUrl) {
            imageUrl = variant.imageUrl;
          }
        }

        // ======================================================
        // STOCK CHECK
        // ======================================================

        if (cartItem.quantity > availableStock) {
          throw new ApiError(
            `"${product.name}" only has ${availableStock} unit(s) available`,
            409,
          );
        }

        // ======================================================
        // LINE TOTAL
        // ======================================================

        const lineTotal = Number((unitPrice * cartItem.quantity).toFixed(2));

        subtotal += lineTotal;

        preparedItems.push({
          productId: product.id,

          variantId: cartItem.variantId ?? null,

          productName: product.name,

          variantName,

          sku,

          imageUrl,

          unitPrice,

          quantity: cartItem.quantity,

          lineTotal,
        });
      }

      subtotal = Number(subtotal.toFixed(2));

      // ========================================================
      // SHIPPING ADDRESS
      // ========================================================

      const shippingAddress = await getUserAddress(
        input.shippingAddressId,
        user.id,
      );

      // ========================================================
      // BILLING ADDRESS
      // ========================================================

      const billingAddress = input.billingAddressId
        ? await getUserAddress(input.billingAddressId, user.id)
        : shippingAddress;

      // ========================================================
      // COUPON
      // ========================================================

      let discount = 0;

      let couponId: string | null = null;

      if (input.couponCode) {
        const couponCode = input.couponCode.trim().toUpperCase();

        const coupon = await tx.query.coupons.findFirst({
          where: {
            code: couponCode,
          },
        });

        if (!coupon || !coupon.isActive) {
          throw new ApiError("Invalid coupon code", 400);
        }

        const now = new Date();

        // Coupon has not started.
        if (coupon.startsAt && coupon.startsAt > now) {
          throw new ApiError("Coupon is not active yet", 400);
        }

        // Coupon has expired.
        if (coupon.expiresAt && coupon.expiresAt < now) {
          throw new ApiError("Coupon has expired", 400);
        }

        // Global coupon limit.
        if (
          coupon.usageLimit !== null &&
          coupon.usedCount >= coupon.usageLimit
        ) {
          throw new ApiError("Coupon usage limit reached", 400);
        }

        // Minimum purchase.
        if (subtotal < Number(coupon.minPurchase)) {
          throw new ApiError(
            `Minimum purchase of NGN ${Number(coupon.minPurchase).toFixed(
              2,
            )} is required`,
            400,
          );
        }

        // ======================================================
        // USER COUPON USAGE
        // ======================================================

        const [usageResult] = await tx
          .select({
            total: count(),
          })
          .from(orders)
          .where(
            and(
              eq(orders.userId, user.id),

              eq(orders.couponId, coupon.id),

              eq(orders.paymentStatus, "paid"),
            ),
          );

        const userUsage = Number(usageResult?.total ?? 0);

        if (userUsage >= coupon.perUserLimit) {
          throw new ApiError(
            "You have already used this coupon the maximum number of times",
            400,
          );
        }

        // ======================================================
        // CALCULATE DISCOUNT
        // ======================================================

        if (coupon.discountType === "percentage") {
          discount = (subtotal * Number(coupon.discountValue)) / 100;
        } else {
          discount = Number(coupon.discountValue);
        }

        // Maximum discount.
        if (coupon.maxDiscount !== null) {
          discount = Math.min(discount, Number(coupon.maxDiscount));
        }

        // Discount cannot exceed subtotal.
        discount = Math.min(discount, subtotal);

        discount = Number(discount.toFixed(2));

        couponId = coupon.id;
      }

      // ========================================================
      // SHIPPING
      // ========================================================

      let shippingCost = SHIPPING_RATES[input.shippingOption];

      if (
        input.shippingOption === "standard" &&
        subtotal >= FREE_SHIPPING_THRESHOLD
      ) {
        shippingCost = 0;
      }

      // ========================================================
      // TAX
      // ========================================================

      const taxableAmount = Number((subtotal - discount).toFixed(2));

      const tax = Number((taxableAmount * TAX_RATE).toFixed(2));

      // ========================================================
      // TOTAL
      // ========================================================

      const total = Number((taxableAmount + tax + shippingCost).toFixed(2));

      // ========================================================
      // CREATE ORDER
      // ========================================================

      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber,

          userId: user.id,

          status: "pending",

          subtotal: subtotal.toFixed(2),

          shippingCost: shippingCost.toFixed(2),

          tax: tax.toFixed(2),

          discount: discount.toFixed(2),

          total: total.toFixed(2),

          currency: "NGN",

          couponId,

          paymentStatus: "pending",

          paymentMethod: input.paymentMethod,

          shippingAddressId: shippingAddress.id,

          billingAddressId: billingAddress.id,

          customerNote: input.customerNote,
        })
        .returning();

      if (!order) {
        throw new ApiError("Unable to create order", 500);
      }

      // ========================================================
      // CREATE ORDER ITEMS
      // ========================================================

      await tx.insert(orderItems).values(
        preparedItems.map((item) => ({
          orderId: order.id,

          productId: item.productId,

          variantId: item.variantId,

          productName: item.productName,

          variantName: item.variantName,

          sku: item.sku,

          imageUrl: item.imageUrl,

          unitPrice: item.unitPrice.toFixed(2),

          quantity: item.quantity,

          subtotal: item.lineTotal.toFixed(2),
        })),
      );

      // ========================================================
      // ADDRESS SNAPSHOTS
      // ========================================================

      await tx.insert(orderAddressSnapshots).values([
        {
          orderId: order.id,

          type: "shipping",

          fullName: shippingAddress.fullName,

          phone: shippingAddress.phone,

          addressLine1: shippingAddress.addressLine1,

          addressLine2: shippingAddress.addressLine2,

          city: shippingAddress.city,

          state: shippingAddress.state,

          postalCode: shippingAddress.postalCode,

          country: shippingAddress.country,
        },

        {
          orderId: order.id,

          type: "billing",

          fullName: billingAddress.fullName,

          phone: billingAddress.phone,

          addressLine1: billingAddress.addressLine1,

          addressLine2: billingAddress.addressLine2,

          city: billingAddress.city,

          state: billingAddress.state,

          postalCode: billingAddress.postalCode,

          country: billingAddress.country,
        },
      ]);

      // ========================================================
      // CREATE PAYMENT
      // ========================================================

      const provider =
        input.paymentMethod === "cash_on_delivery" ? "manual" : "paystack";

      const paymentExpiresAt =
        input.paymentMethod === "cash_on_delivery"
          ? null
          : getPaymentExpirationDate();

      const [payment] = await tx
        .insert(payments)
        .values({
          orderId: order.id,

          provider: provider,

          amount: total.toFixed(2),

          currency: "NGN",

          method: input.paymentMethod,

          status: "pending",

          // For Paystack we create
          // our reference now.
          providerPaymentId:
            input.paymentMethod === "cash_on_delivery"
              ? null
              : paymentReference,

          expiresAt: paymentExpiresAt,
        })
        .returning();

      if (!payment) {
        throw new ApiError("Unable to create payment record", 500);
      }

      // ========================================================
      // INVENTORY
      // ========================================================

      if (input.paymentMethod === "cash_on_delivery") {
        // ======================================================
        // COD
        //
        // COD is considered an accepted order immediately.
        //
        // Therefore:
        //
        // stock is deducted
        // soldCount increases
        // coupon is consumed
        // cart is cleared
        // ======================================================

        for (const item of preparedItems) {
          // ====================================================
          // VARIANT
          // ====================================================

          if (item.variantId) {
            const updatedVariant = await tx
              .update(productVariants)
              .set({
                stock: sql`${productVariants.stock} - ${item.quantity}`,
              })
              .where(
                and(
                  eq(productVariants.id, item.variantId),

                  gte(productVariants.stock, item.quantity),
                ),
              )
              .returning({
                id: productVariants.id,
              });

            if (updatedVariant.length === 0) {
              throw new ApiError(
                `"${item.productName}" is no longer available`,
                409,
              );
            }

            await tx
              .update(products)
              .set({
                soldCount: sql`${products.soldCount} + ${item.quantity}`,

                updatedAt: new Date(),
              })
              .where(eq(products.id, item.productId));

            continue;
          }

          // ====================================================
          // NORMAL PRODUCT
          // ====================================================

          const updatedStock = await tx
            .update(products)
            .set({
              stock: sql`${products.stock} - ${item.quantity}`,

              soldCount: sql`${products.soldCount} + ${item.quantity}`,

              updatedAt: new Date(),
            })
            .where(
              and(
                eq(products.id, item.productId),

                gte(products.stock, item.quantity),
              ),
            )
            .returning({
              id: products.id,

              stock: products.stock,

              lowStockThreshold: products.lowStockThreshold,
            });

          if (updatedStock.length === 0) {
            throw new ApiError(
              `"${item.productName}" is no longer available`,
              409,
            );
          }

          // ====================================================
          // UPDATE STOCK STATUS
          // ====================================================
          //
          // We do this separately so we don't need
          // a large CASE expression inside the stock update.
          // ====================================================

          const updatedProduct = updatedStock[0];

          let stockStatus: "in_stock" | "low_stock" | "out_of_stock";

          if (updatedProduct.stock === 0) {
            stockStatus = "out_of_stock";
          } else if (updatedProduct.stock <= updatedProduct.lowStockThreshold) {
            stockStatus = "low_stock";
          } else {
            stockStatus = "in_stock";
          }

          await tx
            .update(products)
            .set({
              stockStatus,

              updatedAt: new Date(),
            })
            .where(eq(products.id, item.productId));
        }

        // ======================================================
        // CONSUME COD COUPON
        // ======================================================

        if (couponId) {
          const coupon = await tx.query.coupons.findFirst({
            where: {
              id: couponId,
            },
          });

          if (!coupon) {
            throw new ApiError("Coupon no longer exists", 409);
          }

          if (
            coupon.usageLimit !== null &&
            coupon.usedCount >= coupon.usageLimit
          ) {
            throw new ApiError("Coupon usage limit reached", 409);
          }

          await tx
            .update(coupons)
            .set({
              usedCount: sql`${coupons.usedCount} + 1`,
            })
            .where(eq(coupons.id, couponId));
        }

        // ======================================================
        // CLEAR CART
        // ======================================================

        await tx.delete(cartItems).where(eq(cartItems.cartId, currentCart.id));
      } else {
        // ======================================================
        // PAYSTACK
        //
        // We DO NOT permanently deduct stock.
        //
        // We reserve stock instead.
        // ======================================================

        for (const item of preparedItems) {
          // ====================================================
          // VARIANT
          // ====================================================

          if (item.variantId) {
            const reservedVariant = await tx
              .update(productVariants)
              .set({
                reservedStock: sql`${productVariants.reservedStock} + ${item.quantity}`,
              })
              .where(
                and(
                  eq(productVariants.id, item.variantId),

                  gte(
                    sql`${productVariants.stock} - ${productVariants.reservedStock}`,
                    item.quantity,
                  ),
                ),
              )
              .returning({
                id: productVariants.id,
              });

            if (reservedVariant.length === 0) {
              throw new ApiError(
                `"${item.productName}" is no longer available`,
                409,
              );
            }

            continue;
          }

          // ====================================================
          // NORMAL PRODUCT
          // ====================================================

          const reservedProduct = await tx
            .update(products)
            .set({
              reservedStock: sql`${products.reservedStock} + ${item.quantity}`,
            })
            .where(
              and(
                eq(products.id, item.productId),

                gte(
                  sql`${products.stock} - ${products.reservedStock}`,
                  item.quantity,
                ),
              ),
            )
            .returning({
              id: products.id,
            });

          if (reservedProduct.length === 0) {
            throw new ApiError(
              `"${item.productName}" is no longer available`,
              409,
            );
          }
        }
      }

      // ========================================================
      // RETURN RESULT
      // ========================================================

      return {
        order,

        payment,

        total,

        paymentReference,

        cartId: currentCart.id,
      };
    });

    // ==========================================================
    // 6. COD RESPONSE
    // ==========================================================

    if (input.paymentMethod === "cash_on_delivery") {
      return Response.json(
        {
          success: true,

          data: {
            orderId: checkoutResult.order.id,

            orderNumber: checkoutResult.order.orderNumber,

            status: checkoutResult.order.status,

            paymentStatus: checkoutResult.order.paymentStatus,

            paymentRequired: false,

            paymentUrl: null,

            subtotal: Number(checkoutResult.order.subtotal),

            shippingCost: Number(checkoutResult.order.shippingCost),

            tax: Number(checkoutResult.order.tax),

            discount: Number(checkoutResult.order.discount),

            total: Number(checkoutResult.order.total),

            currency: checkoutResult.order.currency,
          },

          message: "Order placed successfully",
        },

        {
          status: 201,
        },
      );
    }

    // ==========================================================
    // 7. CHECK APP URL
    // ==========================================================

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      throw new ApiError("NEXT_PUBLIC_APP_URL is not configured", 500);
    }

    // ==========================================================
    // 8. INITIALIZE PAYSTACK
    // ==========================================================

    const callbackUrl = `${appUrl}/payment/paystack/callback`;

    let paystackTransaction;

    try {
      paystackTransaction = await initializePaystackTransaction({
        email: user.email,

        amount: checkoutResult.total,

        reference: checkoutResult.paymentReference,

        callbackUrl,

        metadata: {
          orderId: checkoutResult.order.id,

          orderNumber: checkoutResult.order.orderNumber,

          paymentId: checkoutResult.payment.id,
        },
      });
    } catch (paystackError) {
      // ========================================================
      // PAYSTACK INITIALIZATION FAILED
      //
      // The transaction already committed the order and
      // reserved stock.
      //
      // Therefore we must undo those reservations.
      // ========================================================

      await db.transaction(async (tx) => {
        const items = await tx.query.orderItems.findMany({
          where: {
            orderId: checkoutResult.order.id,
          },
        });

        // ====================================================
        // RELEASE RESERVED STOCK
        // ====================================================

        for (const item of items) {
          // ----------------------------------------------
          // VARIANT
          // ----------------------------------------------

          if (item.variantId) {
            await tx
              .update(productVariants)
              .set({
                reservedStock: sql`GREATEST(${productVariants.reservedStock} - ${item.quantity}, 0)`,
              })
              .where(eq(productVariants.id, item.variantId));

            continue;
          }

          // ----------------------------------------------
          // NORMAL PRODUCT
          // ----------------------------------------------

          await tx
            .update(products)
            .set({
              reservedStock: sql`GREATEST(${products.reservedStock} - ${item.quantity}, 0)`,

              updatedAt: new Date(),
            })
            .where(eq(products.id, item.productId));
        }

        // ====================================================
        // MARK PAYMENT FAILED
        // ====================================================

        await tx
          .update(payments)
          .set({
            status: "failed",
            failedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(payments.id, checkoutResult.payment.id));

        // ====================================================
        // CANCEL ORDER
        // ====================================================

        await tx
          .update(orders)
          .set({
            status: "cancelled",

            paymentStatus: "failed",

            cancelledAt: new Date(),

            updatedAt: new Date(),
          })
          .where(eq(orders.id, checkoutResult.order.id));
      });

      console.error("Paystack initialization failed:", paystackError);

      throw new ApiError(
        "Unable to initialize payment. Your order was cancelled. Please try again.",
        502,
      );
    }

    // ==========================================================
    // 9. PAYSTACK RESPONSE
    // ==========================================================

    return Response.json(
      {
        success: true,

        data: {
          orderId: checkoutResult.order.id,

          orderNumber: checkoutResult.order.orderNumber,

          status: checkoutResult.order.status,

          paymentStatus: checkoutResult.order.paymentStatus,

          paymentRequired: true,

          paymentUrl: paystackTransaction.authorization_url,

          paymentReference: paystackTransaction.reference,

          subtotal: Number(checkoutResult.order.subtotal),

          shippingCost: Number(checkoutResult.order.shippingCost),

          tax: Number(checkoutResult.order.tax),

          discount: Number(checkoutResult.order.discount),

          total: Number(checkoutResult.order.total),

          currency: checkoutResult.order.currency,
        },

        message: "Order created. Continue to Paystack to complete payment.",
      },

      {
        status: 201,
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
