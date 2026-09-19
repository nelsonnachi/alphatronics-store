import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { Button } from "../../ui/button";

const navigationItems = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Products",
    href: "/products",
  },
  {
    label: "New Arrivals",
    href: "/products?newArrival=true",
  },
  {
    label: "Brands",
    href: "/brands",
  },
  {
    label: "Support",
    href: "/support",
  },
];

export function DesktopNavigation() {
  return (
    <nav className="hidden h-11  bg-white lg:block">
      <div className="flex h-full items-center">

        {/* Navigation Links */}
        <div className="flex h-full items-center gap-8">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex h-full items-center whitespace-nowrap text-sm font-medium text-slate-700 transition-colors hover:text-blue-600"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}