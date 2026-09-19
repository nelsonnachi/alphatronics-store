import { NextRequest } from "next/server";

import { db } from "@/db/drizzle";

import { users, orders, products, refunds } from "@/db/schema";

import { requireAdmin } from "@/lib/APIs/auth";

import { handleApiError } from "@/lib/APIs/api-errors";

import { dashboardQuerySchema } from "@/lib/zod-validations/admin-dashboard";

import { getDashboardDateBounds, toDayKey } from "@/lib/APIs/dashboard-dates";

export const runtime = "nodejs";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type InventoryAlert = {
  productId: string;
  productName: string;
  sku: string;
  type: "product" | "variant";
  variantId?: string;
  variantName?: string;
  stock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold?: number;
};

type BestSeller = {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
};

/*
|--------------------------------------------------------------------------
| HELPER: PERCENTAGE CHANGE
|--------------------------------------------------------------------------
*/

function getPercentChange(current: number, previous: number) {
  if (previous === 0) {
    return null;
  }

  const difference = current - previous;

  const percentage = (difference / previous) * 100;

  return Number(percentage.toFixed(1));
}

/*
|--------------------------------------------------------------------------
| HELPER: TOTAL REVENUE
|--------------------------------------------------------------------------
*/

function calculateRevenue(orders: any[]) {
  let revenue = 0;

  for (const order of orders) {
    revenue += Number(order.total);
  }

  return Number(revenue.toFixed(2));
}

/*
|--------------------------------------------------------------------------
| HELPER: ORDER STATUS BREAKDOWN
|--------------------------------------------------------------------------
*/

function calculateStatusBreakdown(orders: any[]) {
  const breakdown: Record<string, number> = {};

  for (const order of orders) {
    const status = order.status;

    if (breakdown[status] === undefined) {
      breakdown[status] = 1;
    } else {
      breakdown[status]++;
    }
  }

  return breakdown;
}

/*
|--------------------------------------------------------------------------
| HELPER: REVENUE TREND
|--------------------------------------------------------------------------
*/

function calculateRevenueTrend(orders: any[]) {
  const revenueByDay: Record<string, number> = {};

  for (const order of orders) {
    const day = toDayKey(new Date(order.placedAt));

    const amount = Number(order.total);

    if (revenueByDay[day] === undefined) {
      revenueByDay[day] = amount;
    } else {
      revenueByDay[day] += amount;
    }
  }

  const trend: {
    date: string;
    revenue: number;
  }[] = [];

  for (const day in revenueByDay) {
    trend.push({
      date: day,
      revenue: Number(revenueByDay[day].toFixed(2)),
    });
  }

  trend.sort((a, b) => a.date.localeCompare(b.date));

  return trend;
}

/*
|--------------------------------------------------------------------------
| HELPER: CUSTOMER TREND
|--------------------------------------------------------------------------
*/

function calculateCustomerTrend(customers: any[]) {
  const customersByDay: Record<string, number> = {};

  for (const customer of customers) {
    const day = toDayKey(new Date(customer.createdAt));

    if (customersByDay[day] === undefined) {
      customersByDay[day] = 1;
    } else {
      customersByDay[day]++;
    }
  }

  const trend: {
    date: string;
    count: number;
  }[] = [];

  for (const day in customersByDay) {
    trend.push({
      date: day,
      count: customersByDay[day],
    });
  }

  trend.sort((a, b) => a.date.localeCompare(b.date));

  return trend;
}

/*
|--------------------------------------------------------------------------
| HELPER: BEST SELLERS
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| There is only ONE loop through orders
| and ONE loop through each order's items.
|
| We are not using flatMap().
| We are not using Object.groupBy().
|
|--------------------------------------------------------------------------
*/

function calculateBestSellers(orders: any[]) {
  const sales: Record<string, BestSeller> = {};

  for (const order of orders) {
    for (const item of order.items) {
      const productId = item.productId;

      if (sales[productId] === undefined) {
        sales[productId] = {
          productId: productId,
          name: item.productName,
          unitsSold: 0,
          revenue: 0,
        };
      }

      sales[productId].unitsSold += item.quantity;

      sales[productId].revenue += Number(item.subtotal);
    }
  }

  const bestSellers: BestSeller[] = [];

  for (const productId in sales) {
    bestSellers.push({
      productId: sales[productId].productId,

      name: sales[productId].name,

      unitsSold: sales[productId].unitsSold,

      revenue: Number(sales[productId].revenue.toFixed(2)),
    });
  }

  bestSellers.sort((a, b) => b.unitsSold - a.unitsSold);

  return bestSellers.slice(0, 10);
}

/*
|--------------------------------------------------------------------------
| HELPER: INVENTORY
|--------------------------------------------------------------------------
|
| BUSINESS RULE
|
| Product WITHOUT variants:
|
|     products.stock
|
| Product WITH variants:
|
|     productVariants.stock
|
| We NEVER count both.
|
|--------------------------------------------------------------------------
*/

function calculateInventory(products: any[]) {
  let physicalStock = 0;
  let reservedStock = 0;
  let availableStock = 0;

  let totalInventoryProducts = 0;

  let lowStockProducts = 0;
  let outOfStockProducts = 0;

  const lowStockItems: InventoryAlert[] = [];
  const outOfStockItems: InventoryAlert[] = [];

  const lowStockVariants: InventoryAlert[] = [];
  const outOfStockVariants: InventoryAlert[] = [];

  /*
  |--------------------------------------------------------------------------
  | LOOP THROUGH PRODUCTS
  |--------------------------------------------------------------------------
  */

  for (const product of products) {
    const variants = product.variants || [];

    /*
    |--------------------------------------------------------------------------
    | PRODUCT HAS VARIANTS
    |--------------------------------------------------------------------------
    */

    if (variants.length > 0) {
      let productAvailableStock = 0;

      /*
      |--------------------------------------------------------------------------
      | LOOP THROUGH THIS PRODUCT'S VARIANTS
      |--------------------------------------------------------------------------
      */

      for (const variant of variants) {
        if (!variant.isActive) {
          continue;
        }

        const variantAvailableStock = Math.max(
          variant.stock - variant.reservedStock,
          0,
        );

        productAvailableStock += variantAvailableStock;

        physicalStock += variant.stock;

        reservedStock += variant.reservedStock;

        /*
        |--------------------------------------------------------------------------
        | VARIANT LOW STOCK
        |--------------------------------------------------------------------------
        */

        if (
          variantAvailableStock > 0 &&
          variantAvailableStock <= product.lowStockThreshold
        ) {
          lowStockVariants.push({
            productId: product.id,

            productName: product.name,

            sku: variant.sku,

            type: "variant",

            variantId: variant.id,

            variantName: variant.name,

            stock: variant.stock,

            reservedStock: variant.reservedStock,

            availableStock: variantAvailableStock,

            lowStockThreshold: product.lowStockThreshold,
          });
        }

        /*
        |--------------------------------------------------------------------------
        | VARIANT OUT OF STOCK
        |--------------------------------------------------------------------------
        */

        if (variantAvailableStock === 0) {
          outOfStockVariants.push({
            productId: product.id,

            productName: product.name,

            sku: variant.sku,

            type: "variant",

            variantId: variant.id,

            variantName: variant.name,

            stock: variant.stock,

            reservedStock: variant.reservedStock,

            availableStock: 0,
          });
        }
      }

      /*
      |--------------------------------------------------------------------------
      | ADD VARIANT STOCK TO TOTAL
      |--------------------------------------------------------------------------
      */

      availableStock += productAvailableStock;

      totalInventoryProducts++;

      /*
      |--------------------------------------------------------------------------
      | PRODUCT LEVEL LOW STOCK
      |--------------------------------------------------------------------------
      */

      if (
        productAvailableStock > 0 &&
        productAvailableStock <= product.lowStockThreshold
      ) {
        lowStockProducts++;

        lowStockItems.push({
          productId: product.id,

          productName: product.name,

          sku: product.sku,

          type: "product",

          stock: productAvailableStock,

          reservedStock: 0,

          availableStock: productAvailableStock,

          lowStockThreshold: product.lowStockThreshold,
        });
      }

      /*
      |--------------------------------------------------------------------------
      | PRODUCT LEVEL OUT OF STOCK
      |--------------------------------------------------------------------------
      */

      if (productAvailableStock === 0) {
        outOfStockProducts++;

        outOfStockItems.push({
          productId: product.id,

          productName: product.name,

          sku: product.sku,

          type: "product",

          stock: 0,

          reservedStock: 0,

          availableStock: 0,
        });
      }

      continue;
    }

    /*
    |--------------------------------------------------------------------------
    | PRODUCT DOES NOT HAVE VARIANTS
    |--------------------------------------------------------------------------
    */

    const productAvailableStock = Math.max(
      product.stock - product.reservedStock,
      0,
    );

    physicalStock += product.stock;

    reservedStock += product.reservedStock;

    availableStock += productAvailableStock;

    totalInventoryProducts++;

    /*
    |--------------------------------------------------------------------------
    | PRODUCT LOW STOCK
    |--------------------------------------------------------------------------
    */

    if (
      productAvailableStock > 0 &&
      productAvailableStock <= product.lowStockThreshold
    ) {
      lowStockProducts++;

      lowStockItems.push({
        productId: product.id,

        productName: product.name,

        sku: product.sku,

        type: "product",

        stock: product.stock,

        reservedStock: product.reservedStock,

        availableStock: productAvailableStock,

        lowStockThreshold: product.lowStockThreshold,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PRODUCT OUT OF STOCK
    |--------------------------------------------------------------------------
    */

    if (productAvailableStock === 0) {
      outOfStockProducts++;

      outOfStockItems.push({
        productId: product.id,

        productName: product.name,

        sku: product.sku,

        type: "product",

        stock: product.stock,

        reservedStock: product.reservedStock,

        availableStock: 0,
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SORT INVENTORY ALERTS
  |--------------------------------------------------------------------------
  */

  lowStockItems.sort((a, b) => a.availableStock - b.availableStock);

  outOfStockItems.sort((a, b) => a.availableStock - b.availableStock);

  lowStockVariants.sort((a, b) => a.availableStock - b.availableStock);

  outOfStockVariants.sort((a, b) => a.availableStock - b.availableStock);

  /*
  |--------------------------------------------------------------------------
  | RETURN INVENTORY DATA
  |--------------------------------------------------------------------------
  */

  return {
    physicalStock,
    reservedStock,
    availableStock,

    totalInventoryProducts,

    lowStockProducts,
    outOfStockProducts,

    lowStockItems: lowStockItems.slice(0, 10),

    outOfStockItems: outOfStockItems.slice(0, 10),

    lowStockVariants: lowStockVariants.slice(0, 10),

    outOfStockVariants: outOfStockVariants.slice(0, 10),
  };
}

/*
|--------------------------------------------------------------------------
| GET /api/admin/dashboard
|--------------------------------------------------------------------------
*/

export async function GET(req: NextRequest) {
  try {
    /*
    |--------------------------------------------------------------------------
    | STEP 1: ADMIN AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    await requireAdmin();

    /*
    |--------------------------------------------------------------------------
    | STEP 2: GET DASHBOARD RANGE
    |--------------------------------------------------------------------------
    */

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);

    const query = dashboardQuerySchema.parse(searchParams);

    const { start, end, previousStart, previousEnd } = getDashboardDateBounds(
      query.range,
    );

    /*
    |--------------------------------------------------------------------------
    | STEP 3: FETCH EVERYTHING WE NEED
    |--------------------------------------------------------------------------
    |
    | We run independent database queries in parallel.
    |
    */

    const [
      rangeOrders,
      previousRangeOrders,

      newCustomers,
      previousCustomers,

      totalUsers,
      totalOrders,

      pendingOrders,

      inventoryProducts,

      pendingRefunds,

      recentOrders,
    ] = await Promise.all([
      /*
      |--------------------------------------------------------------------------
      | CURRENT PERIOD ORDERS
      |--------------------------------------------------------------------------
      */

      db.query.orders.findMany({
        where: {
          placedAt: {
            gte: start,
            lte: end,
          },
        },

        columns: {
          id: true,
          status: true,
          paymentStatus: true,
          total: true,
          placedAt: true,
        },

        with: {
          items: {
            columns: {
              productId: true,
              productName: true,
              quantity: true,
              subtotal: true,
            },
          },
        },
      }),

      /*
      |--------------------------------------------------------------------------
      | PREVIOUS PERIOD ORDERS
      |--------------------------------------------------------------------------
      */

      db.query.orders.findMany({
        where: {
          placedAt: {
            gte: previousStart,
            lt: previousEnd,
          },
        },

        columns: {
          paymentStatus: true,
          total: true,
        },
      }),

      /*
      |--------------------------------------------------------------------------
      | NEW CUSTOMERS
      |--------------------------------------------------------------------------
      */

      db.query.users.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },

        columns: {
          id: true,
          createdAt: true,
        },
      }),

      /*
      |--------------------------------------------------------------------------
      | PREVIOUS PERIOD CUSTOMERS
      |--------------------------------------------------------------------------
      */

      db.query.users.findMany({
        where: {
          createdAt: {
            gte: previousStart,
            lt: previousEnd,
          },
        },

        columns: {
          id: true,
        },
      }),

      /*
      |--------------------------------------------------------------------------
      | TOTAL USERS
      |--------------------------------------------------------------------------
      */

      db.$count(users),

      /*
      |--------------------------------------------------------------------------
      | TOTAL ORDERS
      |--------------------------------------------------------------------------
      */

      db.$count(orders),

      /*
      |--------------------------------------------------------------------------
      | PENDING ORDERS
      |--------------------------------------------------------------------------
      */

      db.query.orders.findMany({
        where: {
          status: "pending",
        },

        columns: {
          id: true,
        },
      }),

      /*
      |--------------------------------------------------------------------------
      | INVENTORY
      |--------------------------------------------------------------------------
      |
      | We only need ONE inventory query.
      |
      | The variants are included with their product.
      |
      */

      db.query.products.findMany({
        where: {
          isActive: true,

          deletedAt: {
            isNull: true,
          },
        },

        columns: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          reservedStock: true,
          lowStockThreshold: true,
        },

        with: {
          variants: {
            columns: {
              id: true,
              name: true,
              sku: true,
              stock: true,
              reservedStock: true,
              isActive: true,
            },
          },
        },
      }),

      /*
      |--------------------------------------------------------------------------
      | PENDING REFUNDS
      |--------------------------------------------------------------------------
      */

      db.query.refunds.findMany({
        where: {
          status: {
            in: ["pending", "processing"],
          },
        },

        orderBy: {
          createdAt: "asc",
        },

        limit: 20,

        columns: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          reason: true,
          createdAt: true,
        },

        with: {
          order: {
            columns: {
              id: true,
              orderNumber: true,
            },

            with: {
              user: {
                columns: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      }),

      /*
      |--------------------------------------------------------------------------
      | RECENT ORDERS
      |--------------------------------------------------------------------------
      */

      db.query.orders.findMany({
        orderBy: {
          placedAt: "desc",
        },

        limit: 10,

        columns: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
          currency: true,
          placedAt: true,
        },

        with: {
          user: {
            columns: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    /*
    |--------------------------------------------------------------------------
    | STEP 4: GET PAID ORDERS
    |--------------------------------------------------------------------------
    */

    const paidRangeOrders = rangeOrders.filter(
      (order) => order.paymentStatus === "paid",
    );

    const previousPaidOrders = previousRangeOrders.filter(
      (order) => order.paymentStatus === "paid",
    );

    /*
    |--------------------------------------------------------------------------
    | STEP 5: REVENUE
    |--------------------------------------------------------------------------
    */

    const totalRevenue = calculateRevenue(paidRangeOrders);

    const previousRevenue = calculateRevenue(previousPaidOrders);

    /*
    |--------------------------------------------------------------------------
    | STEP 6: ORDER NUMBERS
    |--------------------------------------------------------------------------
    */

    const newOrders = rangeOrders.length;

    const pendingOrderCount = pendingOrders.length;

    /*
    |--------------------------------------------------------------------------
    | STEP 7: AVERAGE ORDER VALUE
    |--------------------------------------------------------------------------
    */

    let averageOrderValue = 0;

    if (paidRangeOrders.length > 0) {
      averageOrderValue = Number(
        (totalRevenue / paidRangeOrders.length).toFixed(2),
      );
    }

    /*
    |--------------------------------------------------------------------------
    | STEP 8: PERIOD CHANGES
    |--------------------------------------------------------------------------
    */

    const revenueChangePercent = getPercentChange(
      totalRevenue,
      previousRevenue,
    );

    const orderCountChangePercent = getPercentChange(
      newOrders,
      previousRangeOrders.length,
    );

    const customerChangePercent = getPercentChange(
      newCustomers.length,
      previousCustomers.length,
    );

    /*
    |--------------------------------------------------------------------------
    | STEP 9: INVENTORY
    |--------------------------------------------------------------------------
    */

    const inventory = calculateInventory(inventoryProducts);

    /*
    |--------------------------------------------------------------------------
    | STEP 10: STATUS BREAKDOWN
    |--------------------------------------------------------------------------
    */

    const statusBreakdown = calculateStatusBreakdown(rangeOrders);

    /*
    |--------------------------------------------------------------------------
    | STEP 11: REVENUE TREND
    |--------------------------------------------------------------------------
    */

    const revenueTrend = calculateRevenueTrend(paidRangeOrders);

    /*
    |--------------------------------------------------------------------------
    | STEP 12: CUSTOMER TREND
    |--------------------------------------------------------------------------
    */

    const newCustomersTrend = calculateCustomerTrend(newCustomers);

    /*
    |--------------------------------------------------------------------------
    | STEP 13: BEST SELLERS
    |--------------------------------------------------------------------------
    */

    const bestSellers = calculateBestSellers(paidRangeOrders);

    /*
    |--------------------------------------------------------------------------
    | STEP 14: RESPONSE
    |--------------------------------------------------------------------------
    */

    return Response.json({
      success: true,

      data: {
        /*
        |--------------------------------------------------------------------------
        | RANGE
        |--------------------------------------------------------------------------
        */

        range: query.range,

        /*
        |--------------------------------------------------------------------------
        | OVERVIEW
        |--------------------------------------------------------------------------
        */

        overview: {
          totalRevenue,

          totalUsers,

          totalOrders,

          newOrders,

          pendingOrders: pendingOrderCount,

          availableStock: inventory.availableStock,

          physicalStock: inventory.physicalStock,

          reservedStock: inventory.reservedStock,

          lowStockProducts: inventory.lowStockProducts,

          outOfStockProducts: inventory.outOfStockProducts,

          totalInventoryProducts: inventory.totalInventoryProducts,
        },

        /*
        |--------------------------------------------------------------------------
        | REVENUE
        |--------------------------------------------------------------------------
        */

        revenue: {
          total: totalRevenue,

          orderCount: newOrders,

          averageOrderValue,

          changeVsPreviousPeriod: revenueChangePercent,

          orderCountChangeVsPreviousPeriod: orderCountChangePercent,

          trend: revenueTrend,
        },

        /*
        |--------------------------------------------------------------------------
        | ORDERS
        |--------------------------------------------------------------------------
        */

        orders: {
          total: totalOrders,

          newInRange: newOrders,

          pending: pendingOrderCount,

          statusBreakdown,
        },

        /*
        |--------------------------------------------------------------------------
        | INVENTORY
        |--------------------------------------------------------------------------
        */

        inventory: {
          totalProducts: inventory.totalInventoryProducts,

          physicalStock: inventory.physicalStock,

          reservedStock: inventory.reservedStock,

          availableStock: inventory.availableStock,

          lowStockProducts: inventory.lowStockProducts,

          outOfStockProducts: inventory.outOfStockProducts,

          lowStockItems: inventory.lowStockItems,

          outOfStockItems: inventory.outOfStockItems,

          lowStockVariants: inventory.lowStockVariants,

          outOfStockVariants: inventory.outOfStockVariants,
        },

        /*
        |--------------------------------------------------------------------------
        | CUSTOMERS
        |--------------------------------------------------------------------------
        */

        customers: {
          total: totalUsers,

          newInRange: newCustomers.length,

          changeVsPreviousPeriod: customerChangePercent,

          trend: newCustomersTrend,
        },

        /*
        |--------------------------------------------------------------------------
        | BEST SELLERS
        |--------------------------------------------------------------------------
        */

        bestSellers,

        /*
        |--------------------------------------------------------------------------
        | REFUNDS
        |--------------------------------------------------------------------------
        */

        pendingRefunds,

        /*
        |--------------------------------------------------------------------------
        | RECENT ORDERS
        |--------------------------------------------------------------------------
        */

        recentOrders,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
