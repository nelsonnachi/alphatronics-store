"use client";

import Image from "next/image";
import { useState } from "react";

import type { ProductImage } from "@/lib/query/products/product-types";

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  // ==========================================================
  // SORT IMAGES
  // ==========================================================

  const sortedImages = [...images].sort(
    (a, b) => a.position - b.position,
  );

  // ==========================================================
  // SELECTED IMAGE
  // ==========================================================

  const [selectedImage, setSelectedImage] =
    useState<ProductImage | null>(
      sortedImages[0] ?? null,
    );

  // ==========================================================
  // NO IMAGE
  // ==========================================================

  if (!selectedImage) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border border-[#E2E8F0] bg-white">
        <span className="text-sm text-[#94A3B8]">
          No product image
        </span>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-3">
      {/* MAIN IMAGE */}

      <div className="relative aspect-square overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        <Image
          src={selectedImage.url}
          alt={
            selectedImage.altText ??
            productName
          }
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-8 sm:p-12"
        />
      </div>

      {/* THUMBNAILS */}

      {sortedImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {sortedImages.map((image) => {
            const isSelected =
              image.id === selectedImage.id;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() =>
                  setSelectedImage(image)
                }
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-white sm:h-20 sm:w-20 ${
                  isSelected
                    ? "border-[#2563EB] ring-2 ring-blue-100"
                    : "border-[#E2E8F0]"
                }`}
              >
                <Image
                  src={image.url}
                  alt={
                    image.altText ??
                    productName
                  }
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}