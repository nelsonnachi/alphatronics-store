import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const banners = [
  {
    image: "/images/banners/smart-tv.png",
    href: "/shop?category=tv-home-theater",
    buttonText: "Shop TVs",
    alt: "Smart TVs",
  },
  {
    image: "/images/banners/home-appliances.png",
    href: "/shop?category=home-appliances",
    buttonText: "Shop Appliances",
    alt: "Home appliances",
  },
  {
    image: "/images/banners/smart-tv.png",
    href: "/shop?category=top-brands",
    buttonText: "Shop Brands",
    alt: "Top electronics brands",
  },
];

export function ProductBanners() {
  return (
    <section className="bg-white py-5 sm:py-6">
      <div className="mx-auto max-w-360 px-4 sm:px-6">
        <div className="grid gap-3 md:grid-cols-3">
          {banners.map((banner) => (
            <Link
              key={banner.href}
              href={banner.href}
              className="group relative min-h-50 overflow-hidden rounded-lg"
            >
              <Image
                src={banner.image}
                alt={banner.alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain transition-transform duration-300 group-hover:scale-105"
              />

              {/* Dark overlay so the button remains visible */}
              {/* <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3B]/95 via-[#0B1F3B]/65 to-transparent" /> */}

              {/* Content */}
              <div className="relative z-10 flex h-full max-w-[75%] flex-col justify-center px-5 py-6 sm:px-6">
                <span className="mt-20 inline-flex w-fit items-center gap-1 rounded-md bg-[#2563EB] px-3 py-2 text-[10px] font-semibold text-white transition-colors group-hover:bg-[#3B82F6]">
                  {banner.buttonText}
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}