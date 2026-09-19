import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CategorySidebar } from "./category-sidebar";
import { DesktopNavigation } from "./desktop-navigation";

export function HeroSection() {
  return (
    <section className="mx-auto my-5 w-full max-w-360 px-4 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* LEFT: Category Sidebar */}
        <CategorySidebar />

        {/* RIGHT: Navigation + Banner */}
        <div className="min-w-0">
          {/* Desktop Navigation */}
          <DesktopNavigation />

          {/* Hero Banner */}
          <div className="relative mt-3 h-55 overflow-hidden rounded-lg bg-[#07111f] sm:h-65 lg:h-100">
            <Image
              src="/images/banners/fridge-banner.jpg"
              alt="Energy-efficient refrigerators"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, calc(100vw - 252px)"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-linear-to-r from-[#07111f]/90 via-[#07111f]/65 to-transparent" />

            {/* Hero Content - Left Side */}
            <div className="absolute inset-y-0 left-0 z-10 flex items-center">
              <div className="max-w-[55%] px-5 sm:max-w-[52%] sm:px-8 lg:max-w-[50%] lg:px-10">
                {/* Badge */}
                <span className="mb-3 inline-flex rounded-full bg-[#2563EB] px-3 py-1 text-[9px] font-bold uppercase tracking-wide text-white sm:text-[10px] lg:text-xs">
                  SAVE UP TO 20%
                </span>

                {/* Power line */}
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#60A5FA] sm:text-xs lg:text-sm">
                  Efficiency. Elegance. Endurance.
                </p>

                {/* Main headline */}
                <h1 className="text-xl font-bold leading-tight text-white sm:text-2xl lg:text-4xl xl:text-5xl">
                  Upgrade your kitchen, lower your bills
                </h1>

                {/* Body text */}
                <p className="mt-3 max-w-md text-[10px] leading-4 text-slate-200 sm:text-xs sm:leading-5 lg:text-sm lg:leading-6">
                  Discover energy-saving models, spacious designs, and
                  unbeatable prices at Alphatronics.
                </p>

                {/* CTA */}
                <Link
                  href="/shop?category=home-appliances"
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#2563EB] px-4 py-2.5 text-[10px] font-semibold text-white transition-colors hover:bg-[#3B82F6] sm:mt-5 sm:px-5 sm:py-3 sm:text-xs"
                >
                  Shop Now
                  <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}