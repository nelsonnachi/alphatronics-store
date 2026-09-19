"use client";

import { UserRole } from "@/lib/query/users/user-types";
import { Search, X } from "lucide-react";


type CustomerFiltersProps = {
  search: string;

  status: "all" | "active" | "banned";

  role: "all" | UserRole;

  sort: "newest" | "oldest" | "name_asc" | "name_desc";

  onSearchChange: (value: string) => void;

  onStatusChange: (value: "all" | "active" | "banned") => void;

  onRoleChange: (value: "all" | UserRole) => void;

  onSortChange: (value: "newest" | "oldest" | "name_asc" | "name_desc") => void;
};

export function CustomerFilters({
  search,
  status,
  role,
  sort,
  onSearchChange,
  onStatusChange,
  onRoleChange,
  onSortChange,
}: CustomerFiltersProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {/* SEARCH */}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search name, email or phone..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* STATUS */}

        <select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as "all" | "active" | "banned")
          }
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="all">All Statuses</option>

          <option value="active">Active</option>

          <option value="banned">Banned</option>
        </select>

        {/* ROLE */}

        <select
          value={role}
          onChange={(event) =>
            onRoleChange(event.target.value as "all" | UserRole)
          }
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="all">All Roles</option>

          <option value="customer">Customers</option>

          <option value="admin">Admins</option>

          <option value="super_admin">Super Admins</option>
        </select>

        {/* SORT */}

        <select
          value={sort}
          onChange={(event) =>
            onSortChange(
              event.target.value as
                | "newest"
                | "oldest"
                | "name_asc"
                | "name_desc",
            )
          }
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="newest">Newest</option>

          <option value="oldest">Oldest</option>

          <option value="name_asc">Name: A-Z</option>

          <option value="name_desc">Name: Z-A</option>
        </select>
      </div>
    </div>
  );
}
