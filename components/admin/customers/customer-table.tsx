"use client";

import Link from "next/link";

import { ExternalLink, MoreHorizontal } from "lucide-react";

import { CustomerStatusBadge } from "./customer-status-badge";
import { AdminUser, UserRole } from "@/lib/query/users/user-types";

type CustomerTableProps = {
  users: AdminUser[];

  isSuperAdmin: boolean;

  onToggleBan: (user: AdminUser) => void;

  onChangeRole: (user: AdminUser, newRole: UserRole) => void;

  updatingUserId?: string;
};

function getFullName(user: AdminUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || "No name";
}

function getInitials(user: AdminUser) {
  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((name) => name!.charAt(0).toUpperCase())
    .join("");

  return initials || user.email.charAt(0).toUpperCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getRoleLabel(role: UserRole) {
  if (role === "super_admin") {
    return "Super Admin";
  }

  if (role === "admin") {
    return "Admin";
  }

  return "Customer";
}

export function CustomerTable({
  users,
  isSuperAdmin,
  onToggleBan,
  onChangeRole,
  updatingUserId,
}: CustomerTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm font-medium text-slate-700">
          No customers found.
        </p>

        <p className="mt-1 text-sm text-slate-400">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-225">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Customer
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Role
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Orders
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Spent
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Joined
              </th>

              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const isUpdating = updatingUserId === user.id;

              const isUserSuperAdmin = user.role === "super_admin";

              const fullName = getFullName(user);

              const initials = getInitials(user);

              return (
                <tr key={user.id} className="transition hover:bg-slate-50">
                  {/* CUSTOMER */}

                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/customers/${user.id}`}
                      className="group flex items-center gap-3"
                    >
                      {user.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.imageUrl}
                          alt={fullName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 group-hover:text-blue-600">
                          {fullName}
                        </p>

                        <p className="max-w-60 truncate text-sm text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </Link>
                  </td>

                  {/* ROLE */}

                  <td className="px-6 py-4">
                    {isSuperAdmin && !isUserSuperAdmin ? (
                      <select
                        value={user.role}
                        disabled={isUpdating}
                        onChange={(event) => {
                          onChangeRole(user, event.target.value as UserRole);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="customer">Customer</option>

                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          user.role === "super_admin"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "admin"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    )}
                  </td>

                  {/* ORDERS */}

                  <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    {user.totalOrders}
                  </td>

                  {/* TOTAL SPENT */}

                  <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      maximumFractionDigits: 0,
                    }).format(Number(user.totalSpent ?? 0))}
                  </td>

                  {/* STATUS */}

                  <td className="px-6 py-4">
                    <CustomerStatusBadge user={user} />
                  </td>

                  {/* JOINED */}

                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDate(user.createdAt)}
                  </td>

                  {/* ACTIONS */}

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/customers/${user.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      >
                        View
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>

                      {isUserSuperAdmin ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                          <MoreHorizontal className="h-4 w-4" />
                          Protected
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => onToggleBan(user)}
                          className={`rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            user.isBanned
                              ? "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                              : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          {isUpdating
                            ? "Updating..."
                            : user.isBanned
                              ? "Unban"
                              : "Ban"}
                        </button>
                      )}
                    </div>
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
