export type DashboardRange =
  | "today"
  | "7d"
  | "30d"
  | "90d";

export type InventoryAlert = {
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

export type BestSeller = {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
};

export type RevenueTrendItem = {
  date: string;
  revenue: number;
};

export type CustomerTrendItem = {
  date: string;
  count: number;
};

export type DashboardRecentOrder = {
  id: string;
  orderNumber: string;

  status: string;
  paymentStatus: string;

  total: string | number;
  currency: string;
  placedAt: string;

  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
};

export type DashboardRefund = {
  id: string;
  amount: string | number;
  currency: string;
  status: string;
  reason: string | null;
  createdAt: string;

  order: {
    id: string;
    orderNumber: string;

    user: {
      firstName: string | null;
      lastName: string | null;
      email: string;
    } | null;
  };
};

export type AdminDashboardData = {
  range: DashboardRange;

  overview: {
    totalRevenue: number;

    totalUsers: number;
    totalOrders: number;

    newOrders: number;
    pendingOrders: number;

    availableStock: number;
    physicalStock: number;
    reservedStock: number;

    lowStockProducts: number;
    outOfStockProducts: number;

    totalInventoryProducts: number;
  };

  revenue: {
    total: number;
    orderCount: number;
    averageOrderValue: number;

    changeVsPreviousPeriod: number | null;
    orderCountChangeVsPreviousPeriod: number | null;

    trend: RevenueTrendItem[];
  };

  orders: {
    total: number;
    newInRange: number;
    pending: number;

    statusBreakdown: Record<string, number>;
  };

  inventory: {
    totalProducts: number;

    physicalStock: number;
    reservedStock: number;
    availableStock: number;

    lowStockProducts: number;
    outOfStockProducts: number;

    lowStockItems: InventoryAlert[];
    outOfStockItems: InventoryAlert[];

    lowStockVariants: InventoryAlert[];
    outOfStockVariants: InventoryAlert[];
  };

  customers: {
    total: number;
    newInRange: number;

    changeVsPreviousPeriod: number | null;

    trend: CustomerTrendItem[];
  };

  bestSellers: BestSeller[];

  pendingRefunds: DashboardRefund[];

  recentOrders: DashboardRecentOrder[];
};

export type AdminDashboardResponse = {
  success: true;
  data: AdminDashboardData;
};