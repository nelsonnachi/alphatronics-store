import type {
  AdminInventoryMovement,
  InventoryMovementDirection,
} from "@/lib/query/inventories/admin-inventory-types";

type InventoryMovementTableProps = {
  movements: AdminInventoryMovement[];
};

function getMovementDirection(
  movement: AdminInventoryMovement,
): InventoryMovementDirection {
  if (
    movement.type === "purchase" ||
    movement.type === "return" ||
    movement.type === "restock"
  ) {
    return "increase";
  }

  return "decrease";
}

function getMovementTypeLabel(type: string) {
  switch (type) {
    case "purchase":
      return "Purchase";

    case "adjustment":
      return "Adjustment";

    case "sale":
      return "Sale";

    case "return":
      return "Return";

    case "release":
      return "Release";

    case "damage":
      return "Damage";

    case "restock":
      return "Restock";

    default:
      return type;
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function getUserName(
  user: AdminInventoryMovement["user"],
) {
  if (!user) {
    return "System";
  }

  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ");

  return fullName || user.email;
}

export function InventoryMovementTable({
  movements,
}: InventoryMovementTableProps) {
  if (movements.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
        <h3 className="text-lg font-semibold text-[#0B1F3B]">
          No inventory movements found
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-300">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Product
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Type
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Quantity
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Before
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                After
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reason
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                User
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Order
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </th>
            </tr>
          </thead>

          <tbody>
            {movements.map((movement) => {
              const direction =
                getMovementDirection(movement);

              const isIncrease =
                direction === "increase";

              return (
                <tr
                  key={movement.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                >
                  {/* PRODUCT */}

                  <td className="px-5 py-4">
                    {movement.product ? (
                      <div>
                        <p className="font-medium text-[#0B1F3B]">
                          {movement.product.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          SKU: {movement.product.sku}
                        </p>

                        {movement.variant && (
                          <p className="mt-1 text-xs text-slate-500">
                            Variant:{" "}
                            {movement.variant.name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">
                        Product unavailable
                      </span>
                    )}
                  </td>

                  {/* TYPE */}

                  <td className="px-5 py-4">
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {getMovementTypeLabel(
                        movement.type,
                      )}
                    </span>
                  </td>

                  {/* QUANTITY */}

                  <td className="px-5 py-4 text-right">
                    <span
                      className={
                        isIncrease
                          ? "font-semibold text-green-600"
                          : "font-semibold text-red-600"
                      }
                    >
                      {isIncrease ? "+" : "-"}
                      {movement.quantity.toLocaleString()}
                    </span>
                  </td>

                  {/* BEFORE */}

                  <td className="px-5 py-4 text-right text-sm text-slate-600">
                    {movement.stockBefore.toLocaleString()}
                  </td>

                  {/* AFTER */}

                  <td className="px-5 py-4 text-right text-sm font-semibold text-[#0B1F3B]">
                    {movement.stockAfter.toLocaleString()}
                  </td>

                  {/* REASON */}

                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-600">
                      {movement.reason || "—"}
                    </span>
                  </td>

                  {/* USER */}

                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {getUserName(movement.user)}
                      </p>

                      {movement.user && (
                        <p className="mt-1 text-xs text-slate-400">
                          {movement.user.email}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* ORDER */}

                  <td className="px-5 py-4">
                    {movement.order ? (
                      <span className="text-sm font-medium text-blue-600">
                        {movement.order.orderNumber}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">
                        —
                      </span>
                    )}
                  </td>

                  {/* DATE */}

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                    {formatDate(movement.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}