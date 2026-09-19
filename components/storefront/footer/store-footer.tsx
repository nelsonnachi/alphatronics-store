import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa"; 


export function StoreFooter() {
  return (
    <footer className="bg-[#0B1F3B] text-white mt-10">
      <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-8">

        {/* =========================================================
            MAIN FOOTER
            ========================================================= */}

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1.3fr] lg:gap-8 lg:py-14">

          {/* =======================================================
              BRAND / ABOUT
              ======================================================= */}

          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2"
              aria-label="Alphatronics home"
            >
              {/* Logo mark */}
              <div className="relative flex h-8 w-8 items-center justify-center">
                <span className="text-4xl font-black leading-none italic text-[#2563EB]">
                  A
                </span>
              </div>

              <span className="text-lg font-bold tracking-tight">
                Alphatronics
              </span>
            </Link>

            <p className="mt-5 max-w-62.5 text-sm leading-6 text-slate-300">
              Your trusted electronics store.
            </p>

            {/* Social media */}
            <div className="mt-6 flex items-center gap-4">
              <Link
                href="#"
                aria-label="Facebook"
                className="text-slate-300 transition-colors hover:text-[#3B82F6]"
              >
                <FaFacebook className="h-4 w-4" />
              </Link>

              {/* X / Twitter */}
              <Link
                href="#"
                aria-label="X"
                className="text-sm font-semibold text-slate-300 transition-colors hover:text-[#3B82F6]"
              >
                𝕏
              </Link>

              <Link
                href="#"
                aria-label="Instagram"
                className="text-slate-300 transition-colors hover:text-[#3B82F6]"
              >
                <FaInstagram className="h-4 w-4" />
              </Link>

              <Link
                href="#"
                aria-label="YouTube"
                className="text-slate-300 transition-colors hover:text-[#3B82F6]"
              >
                <FaYoutube className="h-4 w-4" />
              </Link>

              {/* TikTok */}
              <Link
                href="#"
                aria-label="TikTok"
                className="text-sm font-bold text-slate-300 transition-colors hover:text-[#3B82F6]"
              >
                ♪
              </Link>
            </div>
          </div>

          {/* =======================================================
              QUICK LINKS
              ======================================================= */}

          <div>
            <h3 className="text-sm font-semibold text-white">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/products">Shop</FooterLink>
              <FooterLink href="/deals">Deals</FooterLink>
              <FooterLink href="/new-arrivals">
                New Arrivals
              </FooterLink>
              <FooterLink href="/best-sellers">
                Best Sellers
              </FooterLink>
              <FooterLink href="/brands">Brands</FooterLink>
            </ul>
          </div>

          {/* =======================================================
              CUSTOMER SERVICE
              ======================================================= */}

          <div>
            <h3 className="text-sm font-semibold text-white">
              Customer Service
            </h3>

            <ul className="mt-5 space-y-3">
              <FooterLink href="/support">
                Help Center
              </FooterLink>

              <FooterLink href="/shipping">
                Shipping Information
              </FooterLink>

              <FooterLink href="/returns">
                Returns & Refunds
              </FooterLink>

              <FooterLink href="/warranty">
                Warranty Policy
              </FooterLink>

              <FooterLink href="/track-order">
                Track Order
              </FooterLink>

              <FooterLink href="/contact">
                Contact Us
              </FooterLink>
            </ul>
          </div>

          {/* =======================================================
              ABOUT US
              ======================================================= */}

          <div>
            <h3 className="text-sm font-semibold text-white">
              About Us
            </h3>

            <ul className="mt-5 space-y-3">
              <FooterLink href="/about">
                About Alphatronics
              </FooterLink>

              <FooterLink href="/careers">
                Careers
              </FooterLink>

              <FooterLink href="/blog">
                Blog
              </FooterLink>

              <FooterLink href="/terms">
                Terms & Conditions
              </FooterLink>

              <FooterLink href="/privacy">
                Privacy Policy
              </FooterLink>
            </ul>
          </div>

          {/* =======================================================
              NEWSLETTER
              ======================================================= */}

          <div>
            <h3 className="text-sm font-semibold text-white">
              Subscribe to our newsletter
            </h3>

            <p className="mt-5 text-sm leading-6 text-slate-300">
              Get the latest deals, updates and more.
            </p>

            <form className="mt-5">
              <div className="flex overflow-hidden rounded-md bg-white">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  aria-label="Email address"
                  className="min-w-0 flex-1 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="flex h-10 w-11 shrink-0 items-center justify-center bg-[#2563EB] text-white transition-colors hover:bg-[#1D4ED8]"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* =========================================================
            BOTTOM SECTION
            ========================================================= */}

        <div className="border-t border-slate-700/70 py-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            {/* Copyright */}
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Alphatronics. All rights reserved.
            </p>

            {/* Payment methods */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-black italic text-white">
                VISA
              </span>

              <span className="flex items-center text-sm font-bold text-white">
                <span className="-mr-1 inline-block h-4 w-4 rounded-full bg-[#EF4444]" />
                <span className="inline-block h-4 w-4 rounded-full bg-[#F59E0B]" />
              </span>

              <span className="text-sm font-bold text-white">
                paystack
              </span>

              <span className="text-sm font-semibold text-white">
                verve
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ===============================================================
   REUSABLE FOOTER LINK
   =============================================================== */

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-xs text-slate-300 transition-colors hover:text-white"
      >
        {children}
      </Link>
    </li>
  );
}