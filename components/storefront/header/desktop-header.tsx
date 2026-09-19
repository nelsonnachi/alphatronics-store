"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Heart,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "../../ui/button";
import { GlobalNavigation } from "./global-navigation";
import { DesktopNavigation } from "./desktop-navigation";
import { CartProvider } from "../cart/cart-provider";
import { AuthMenu } from "@/components/auth-clerk/auth-menu";

export function DesktopHeader() {
  const pathname = usePathname();

  /*
   * The homepage has its own search/navigation arrangement.
   *
   * Therefore:
   * - Don't show the global search on "/"
   * - Don't show the global navigation on "/"
   *
   * The HeroSection handles those on the homepage.
   */
  const isHomePage = pathname === "/";

  /*
   * Search is open by default on other pages.
   *
   * When false:
   * the navigation moves into the search position.
   */
  const [isSearchOpen, setIsSearchOpen] =
    useState(!isHomePage);

  /*
   * If the user navigates back to the homepage,
   * make sure the global search is closed.
   */
  useEffect(() => {
    if (isHomePage) {
      setIsSearchOpen(false);
    } else {
      setIsSearchOpen(true);
    }
  }, [isHomePage]);

  return (
    <div className="hidden bg-white shadow-md lg:block">
      {/* =====================================================
          MAIN HEADER
      ===================================================== */}

      <div className="mx-auto max-w-360 px-6 lg:px-8">
        <div className="flex min-h-18 items-center gap-8">

          {/* =================================================
              LOGO
          ================================================= */}

          <Link
            href="/"
            className="flex shrink-0 items-center gap-2"
            aria-label="Alphatronics home"
          >
            <div className="flex size-9 items-center justify-center">
              <span className="text-3xl font-black text-blue-600">
                A
              </span>
            </div>

            <span className="text-xl font-bold tracking-tight text-[#111827]">
              Alphatronics
            </span>
          </Link>

          {/* =================================================
              CENTER AREA
          ================================================= */}

          <div className="min-w-0 flex-1">
            {isHomePage ? null : isSearchOpen ? (
              /* =============================================
                 SEARCH OPEN
              ============================================= */

              <form
                action="/products"
                method="GET"
                className="flex min-w-0 w-full"
              >
                <div className="relative flex w-full">
                  <input
                    type="search"
                    name="search"
                    placeholder="Search for products, brands and more..."
                    aria-label="Search products"
                    autoFocus
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-4 pr-14 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />

                  <Button
                    type="submit"
                    size="icon"
                    aria-label="Search products"
                    className="absolute right-0 top-0 h-10 w-11 rounded-l-none rounded-r-lg bg-blue-600 hover:bg-blue-700"
                  >
                    <Search className="size-4" />
                  </Button>
                </div>
              </form>
            ) : (
              /* =============================================
                 SEARCH CLOSED
                 NAVIGATION TAKES SEARCH POSITION
              ============================================= */

              <DesktopNavigation />
            )}
          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex shrink-0 items-center gap-5">

            {/* =================================================
                SEARCH TOGGLE
            ================================================= */}

            {!isHomePage && (
              <button
                type="button"
                aria-label={
                  isSearchOpen
                    ? "Close search"
                    : "Open search"
                }
                onClick={() =>
                  setIsSearchOpen(
                    (current) => !current,
                  )
                }
                className="group flex items-center justify-center"
              >
                {isSearchOpen ? (
                  <X className="size-5 text-slate-800 transition group-hover:text-blue-600" />
                ) : (
                  <Search className="size-5 text-slate-800 transition group-hover:text-blue-600" />
                )}
              </button>
            )}

            {/* =================================================
                ACCOUNT
            ================================================= */}

            <AuthMenu />

            {/* =================================================
                WISHLIST
            ================================================= */}

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="group flex items-center justify-center"
            >
              <Heart className="size-5 text-slate-800 transition group-hover:text-blue-600" />
            </Link>

            {/* =================================================
                CART
            ================================================= */}

            <CartProvider />

          </div>
        </div>

        {/* =====================================================
            GLOBAL NAVIGATION WHEN SEARCH IS OPEN

            When search is open, navigation gets its own row.

            When search is closed, navigation has already moved
            into the center area above.
        ===================================================== */}

        {!isHomePage && isSearchOpen && (
          <GlobalNavigation />
        )}
      </div>
    </div>
  );
}