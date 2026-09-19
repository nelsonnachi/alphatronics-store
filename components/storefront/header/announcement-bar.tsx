"use client";

import { useEffect, useState } from "react";
import {
  Clock3,
  Headphones,
  ShieldCheck,
  Truck,
} from "lucide-react";

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    function handleScroll() {
      // Show the announcement when the user is at
      // the very top of the page.
      if (window.scrollY === 0) {
        setIsVisible(true);
        return;
      }

      // Hide it once the user starts scrolling down.
      setIsVisible(false);
    }

    // Check the initial position.
    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`overflow-hidden bg-[#07111f] text-white transition-all duration-300 ${
        isVisible
          ? "max-h-8 opacity-100"
          : "max-h-0 opacity-0"
      }`}
    >
      <div className="mx-auto flex h-8 max-w-360 items-center justify-between px-4 text-[11px] sm:px-6 lg:px-8">
        {/* =====================================================
            LEFT
        ===================================================== */}

        <div className="flex items-center gap-2">
          <Truck className="size-3 text-blue-400" />

          <span>
            Free shipping on orders over ₦50,000
          </span>
        </div>

        {/* =====================================================
            RIGHT
        ===================================================== */}

        <div className="hidden items-center gap-6 md:flex">
          <div className="flex items-center gap-2">
            <Clock3 className="size-3 text-blue-400" />

            <span>
              Easy Returns (7 days)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="size-3 text-blue-400" />

            <span>
              Secure Payments
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Headphones className="size-3 text-blue-400" />

            <span>
              24/7 Support
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}