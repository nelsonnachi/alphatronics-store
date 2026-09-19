import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

import { TestimonialCard } from "./TestimonialCard";

const products = [
  {
    image: "/images/banners/proCustomerB.jpg",
    href: "/shop?category=air-conditioners",
    alt: "Air conditioners",
  },
  {
    image: "/images/banners/smart-tv.png",
    href: "/shop?category=tv-home-theater",
    alt: "Smart TVs",
  },
  {
    image: "/images/banners/home-appliances.png",
    href: "/shop?category=home-appliances",
    alt: "Home appliances",
  },
];

export function FeaturedShowcase() {
  return (
    <section className="bg-[#F8FAFC] py-6 sm:py-8">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">

        {/* Section Header */}
        <div className="mb-5 flex items-start justify-between sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Quote className="h-4 w-4 shrink-0 text-[#2563EB]" />

              <h2 className="text-base font-bold text-[#0F172A] sm:text-lg">
                What Our Customers Say
              </h2>
            </div>

            <p className="mt-1 max-w-2xl text-xs text-[#64748B]">
              Your satisfaction is our priority. Read what our customers have
              to say about their shopping experience with us.
            </p>
          </div>
        </div>

        {/* Main Showcase */}
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.5fr_0.8fr]">


          <div className="order-1 flex lg:order-1 lg:items-center">
            <TestimonialCard
              name="Michael Joseph"
              role="Verified Customer"
              message="The product arrived exactly as described. Delivery was fast and the whole shopping experience was excellent."
            />
          </div>


          <div className="order-2 relative min-h-[300px] overflow-hidden rounded-xl sm:min-h-[360px] lg:order-2 lg:min-h-[430px]">
            <Image
              src={products[0].image}
              alt={products[0].alt}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />

            {/* Image overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3B]/70 via-transparent to-transparent" />

            {/* Shop button */}
            <div className="absolute bottom-0 left-0 z-10 p-5 sm:p-7">
              <Link
                href={products[0].href}
                className="inline-flex items-center gap-2 rounded-md bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#3B82F6]"
              >
                Shop Now
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="order-3 flex lg:order-3 lg:items-center">
            <TestimonialCard
              name="Anita Johnson"
              role="Verified Customer"
              message="Great quality products and a very smooth ordering process. I will definitely shop here again."
            />
          </div>

        </div>
      </div>
    </section>
  );
}