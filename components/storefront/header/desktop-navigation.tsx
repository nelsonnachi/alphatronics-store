import Link from "next/link";

import { navigationItems } from "./navigation-items";

type DesktopNavigationProps = {
  compact?: boolean;
};

export function DesktopNavigation({
  compact = false,
}: DesktopNavigationProps) {
  return (
    <nav
      className={
        compact
          ? "hidden lg:block"
          : "hidden border-b bg-white lg:block"
      }
    >
      <div
        className={
          compact
            ? "flex h-18 items-center justify-center"
            : "mx-auto flex h-11 max-w-360 items-center justify-center px-6 lg:px-8"
        }
      >
        <div className="flex h-full items-center gap-8">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex h-full items-center whitespace-nowrap text-sm font-medium text-slate-700 transition hover:text-blue-600"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}