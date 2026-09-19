"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClerkLoaded, ClerkLoading, UserButton, useUser } from "@clerk/nextjs";
import {
  Boxes,
  ChevronRight,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Package,
  RotateCcw,
  Settings,
  ShoppingCart,
  Tag,
  Tags,
  Users,
  X,
} from "lucide-react";

type AdminSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

const navigation = [
  {
    label: "",
    items: [
      {
        name: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    label: "CATALOG",
    items: [
      {
        name: "Products",
        href: "/admin/products",
        icon: Package,
      },
      {
        name: "Categories",
        href: "/admin/categories",
        icon: ClipboardList,
      },
      {
        name: "Brands",
        href: "/admin/brands",
        icon: Tags,
      },
      {
        name: "Inventory",
        href: "/admin/inventory",
        icon: Boxes,
      },
    ],
  },

  {
    label: "SALES",
    items: [
      {
        name: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
      },
      {
        name: "Payments",
        href: "/admin/payments",
        icon: CreditCard,
      },
      {
        name: "Refunds",
        href: "/admin/refunds",
        icon: RotateCcw,
      },
      {
        name: "Coupons",
        href: "/admin/coupons",
        icon: Tag,
      },
    ],
  },

  {
    label: "CUSTOMERS",
    items: [
      {
        name: "Customers",
        href: "/admin/customers",
        icon: Users,
      },
    ],
  },

  {
    label: "INSIGHTS",
    items: [
      {
        name: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export function AdminSidebar({ mobileOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();

  const displayName =
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress ||
    "Store Administrator";

  // Optional: reads a role you've set in Clerk's public metadata
  const role = (user?.publicMetadata?.role as string | undefined) ?? "Admin";

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col overflow-y-auto bg-[#0b1330] px-4 py-[22px] text-[#c9d2ec] transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-2 pb-[14px]">
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#3b6ff0] to-[#5b8bff] text-[17px] font-bold text-white">
              A
            </div>

            <div>
              <div className="text-[15px] font-bold leading-[1.15] text-white">
                Alphatronics
              </div>

              <div className="pt-1 text-[10.5px] tracking-[0.03em] text-[#8b95b8]">
                ADMIN PANEL
              </div>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#8b95b8] hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-5 flex-1">
          {navigation.map((group) => (
            <div key={group.label || "main"} className="mb-5">
              {group.label && (
                <div className="mb-1.5 px-3 text-[10.5px] font-bold tracking-[0.06em] text-[#5f6a91]">
                  {group.label}
                </div>
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={`group flex items-center gap-[11px] rounded-[9px] px-3 py-[9px] text-[13.5px] transition-colors ${
                        isActive
                          ? "bg-[#2f5fe0] text-white shadow-[0_4px_10px_rgba(47,95,224,0.35)]"
                          : "text-[#b9c2e0] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon
                        className={`h-[17px] w-[17px] shrink-0 ${
                          isActive ? "opacity-100" : "opacity-85"
                        }`}
                      />

                      <span>{item.name}</span>

                      {item.name === "Settings" && (
                        <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Admin account (Clerk) */}
        <div className="flex items-center gap-2.5 border-t border-white/[0.08] px-3 pt-3">
          <ClerkLoading>
            <div className="h-[34px] w-[34px] shrink-0 animate-pulse rounded-full bg-white/10" />
            <div className="space-y-1.5">
              <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
              <div className="h-2.5 w-12 animate-pulse rounded bg-white/10" />
            </div>
          </ClerkLoading>

          <ClerkLoaded>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-[34px] w-[34px]",
                },
              }}
            />

            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-semibold text-white">
                {displayName}
              </div>

              <div className="text-[10.5px] capitalize text-[#8b95b8]">
                {role}
              </div>
            </div>
          </ClerkLoaded>
        </div>
      </aside>
    </>
  );
}
