"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type { Brand } from "@/lib/query/brands/brand-types";

type BrandFormData = {
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  isActive: boolean;
};

type BrandFormProps = {
  brand: Brand | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: BrandFormData) => void;
};

export function BrandForm({
  brand,
  isSubmitting,
  onClose,
  onSubmit,
}: BrandFormProps) {
  const isEditing = Boolean(brand);

  // ============================================================
  // FORM STATE
  // ============================================================

  const [name, setName] = useState("");

  const [slug, setSlug] = useState("");

  const [logoUrl, setLogoUrl] = useState("");

  const [description, setDescription] =
    useState("");

  const [website, setWebsite] = useState("");

  const [isActive, setIsActive] =
    useState(true);

  // ============================================================
  // LOAD EDIT DATA
  // ============================================================

  useEffect(() => {
    if (!brand) {
      setName("");
      setSlug("");
      setLogoUrl("");
      setDescription("");
      setWebsite("");
      setIsActive(true);

      return;
    }

    setName(brand.name);

    setSlug(brand.slug);

    setLogoUrl(brand.logoUrl ?? "");

    setDescription(
      brand.description ?? "",
    );

    setWebsite(
      brand.website ?? "",
    );

    setIsActive(brand.isActive);
  }, [brand]);

  // ============================================================
  // GENERATE SLUG
  // ============================================================

  function handleNameChange(value: string) {
    setName(value);

    // Automatically create a slug
    // only while creating a new brand.

    if (!isEditing) {
      const generatedSlug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      setSlug(generatedSlug);
    }
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    onSubmit({
      name: name.trim(),

      slug: slug.trim(),

      logoUrl: logoUrl.trim() || undefined,

      description:
        description.trim() || undefined,

      website:
        website.trim() || undefined,

      isActive,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* ======================================================
            HEADER
        ======================================================= */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing
                ? "Edit Brand"
                : "Add Brand"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {isEditing
                ? "Update this brand information."
                : "Create a new brand for your store."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ======================================================
            FORM
        ======================================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5"
        >
          {/* ====================================================
              BRAND NAME
          ===================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Brand Name
            </label>

            <input
              value={name}
              onChange={(event) =>
                handleNameChange(
                  event.target.value,
                )
              }
              placeholder="e.g. Apple"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* ====================================================
              SLUG
          ===================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Slug
            </label>

            <input
              value={slug}
              onChange={(event) =>
                setSlug(
                  event.target.value,
                )
              }
              placeholder="apple"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-xs text-slate-400">
              Lowercase words separated by hyphens.
            </p>
          </div>

          {/* ====================================================
              LOGO URL
          ===================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Logo URL
            </label>

            <input
              type="url"
              value={logoUrl}
              onChange={(event) =>
                setLogoUrl(
                  event.target.value,
                )
              }
              placeholder="https://example.com/logo.png"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-xs text-slate-400">
              Use a publicly accessible image URL.
            </p>

            {logoUrl && (
              <div className="mt-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt="Brand logo preview"
                  className="h-full w-full object-contain p-2"
                />
              </div>
            )}
          </div>

          {/* ====================================================
              WEBSITE
          ===================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Website
            </label>

            <input
              type="url"
              value={website}
              onChange={(event) =>
                setWebsite(
                  event.target.value,
                )
              }
              placeholder="https://www.apple.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* ====================================================
              DESCRIPTION
          ===================================================== */}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                Description
              </label>

              <span className="text-xs text-slate-400">
                {description.length}/500
              </span>
            </div>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              maxLength={500}
              rows={5}
              placeholder="Describe this brand..."
              className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* ====================================================
              ACTIVE
          ===================================================== */}

          <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-4">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) =>
                setIsActive(
                  event.target.checked,
                )
              }
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />

            <div>
              <p className="text-sm font-medium text-slate-800">
                Active Brand
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Active brands can appear in the storefront.
              </p>
            </div>
          </label>

          {/* ====================================================
              ACTIONS
          ===================================================== */}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Brand"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}