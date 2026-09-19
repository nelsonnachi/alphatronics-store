"use client";

import { useRef } from "react";
import { ImagePlus, X, Star } from "lucide-react";

import type { ProductImageForm } from "./add-product-form";

type ProductImagesProps = {
  images: ProductImageForm[];
  onImagesChange: (images: ProductImageForm[]) => void;
};

export function ProductImages({ images, onImagesChange }: ProductImagesProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;

    const newImages: ProductImageForm[] = [];

    Array.from(files).forEach((file) => {
      const preview = URL.createObjectURL(file);

      newImages.push({
        id: crypto.randomUUID(),
        file,
        preview,
        altText: "",
        isPrimary: images.length === 0 && newImages.length === 0,
      });
    });

    onImagesChange([...images, ...newImages]);
  }

  function removeImage(id: string) {
    const imageToRemove = images.find((image) => image.id === id);

    if (imageToRemove?.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    const filteredImages = images.filter((image) => image.id !== id);

    if (
      filteredImages.length > 0 &&
      !filteredImages.some((image) => image.isPrimary)
    ) {
      filteredImages[0].isPrimary = true;
    }

    onImagesChange(filteredImages);
  }

  function makePrimary(id: string) {
    onImagesChange(
      images.map((image) => ({
        ...image,
        isPrimary: image.id === id,
      })),
    );
  }

  function updateAltText(id: string, value: string) {
    onImagesChange(
      images.map((image) =>
        image.id === id
          ? {
              ...image,
              altText: value,
            }
          : image,
      ),
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-900">Product Images</h2>

          <p className="text-xs text-slate-500">
            Upload product images. At least one image is required.
          </p>
        </div>
      </div>

      <div className="p-5">
        {/* UPLOAD */}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/30"
        >
          <div className="mb-3 rounded-full bg-blue-50 p-3 text-blue-600">
            <ImagePlus className="h-6 w-6" />
          </div>

          <p className="text-sm font-semibold text-slate-700">
            Click to upload product images
          </p>

          <p className="mt-1 text-xs text-slate-400">PNG, JPG or WEBP</p>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files);

            event.target.value = "";
          }}
        />

        {/* IMAGE LIST */}

        {images.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="rounded-xl border border-slate-200 p-3"
              >
                <div className="flex gap-3">
                  {/* PREVIEW */}

                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.preview}
                      alt={image.altText || `Product image ${index + 1}`}
                      className="h-full w-full object-contain p-2"
                    />

                    {image.isPrimary && (
                      <span className="absolute left-1 top-1 rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                        Primary
                      </span>
                    )}
                  </div>

                  {/* DETAILS */}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-700">
                      {image.file?.name}
                    </p>

                    <button
                      type="button"
                      onClick={() => makePrimary(image.id)}
                      disabled={image.isPrimary}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 disabled:text-slate-400"
                    >
                      <Star className="h-3.5 w-3.5" />
                      {image.isPrimary ? "Primary image" : "Make primary"}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="ml-3 inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>

                {/* ALT TEXT */}

                <div className="mt-3">
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Alt text
                  </label>

                  <input
                    value={image.altText}
                    onChange={(event) =>
                      updateAltText(image.id, event.target.value)
                    }
                    placeholder="Describe this image"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
