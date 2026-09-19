import Link from "next/link";
import {
  Heart,
  Menu,
  Search,
  ShoppingCart,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";

import { Button } from "../../ui/button";
import { navigationItems } from "./navigation-items";
import { CartProvider } from "../cart/cart-provider";

export function MobileHeader() {
  return (
    <div className="border-b bg-white lg:hidden">

      {/* =====================================================
          MAIN MOBILE ROW
      ===================================================== */}

      <div className="flex h-16 items-center justify-between px-4">

        {/* Menu */}

        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation menu"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-75 max-w-[85vw] p-0"
          >
            <SheetHeader className="border-b px-5 py-4 text-left">
              <SheetTitle>
                Alphatronics
              </SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col p-4">

              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-600"
                >
                  {item.label}
                </Link>
              ))}

              <div className="my-3 border-t" />

              <Link
                href="/wishlist"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <Heart className="size-4" />
                Wishlist
              </Link>

              <Link
                href="/account"
                className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Account
              </Link>

            </nav>
          </SheetContent>
        </Sheet>

        {/* =====================================================
            LOGO
        ===================================================== */}

        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="Alphatronics home"
        >
          <span className="text-2xl font-black text-blue-600">
            A
          </span>

          <span className="text-lg font-bold text-slate-900">
            Alphatronics
          </span>
        </Link>

        {/* =====================================================
            CART
        ===================================================== */}

        <CartProvider />
      </div>

      {/* =====================================================
          MOBILE SEARCH
      ===================================================== */}

      <div className="border-t px-4 py-3">

        <form
          action="/products"
          method="GET"
          className="relative"
        >
          <input
            type="search"
            name="search"
            placeholder="Search products, brands and more..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 pr-12 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
          />

          <Button
            type="submit"
            size="icon"
            className="absolute right-0 top-0 h-10 w-11 rounded-l-none rounded-r-lg bg-blue-600 hover:bg-blue-700"
            aria-label="Search"
          >
            <Search className="size-4" />
          </Button>
        </form>

      </div>
    </div>
  );
}