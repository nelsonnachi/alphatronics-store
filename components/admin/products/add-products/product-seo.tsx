"use client";

import { Search } from "lucide-react";

type ProductSeoProps = {
  metaTitle: string;
  metaDescription: string;

  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
};

export function ProductSeo({
  metaTitle,
  metaDescription,
  onMetaTitleChange,
  onMetaDescriptionChange,
}: ProductSeoProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <Search className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Search Engine Optimization
            </h2>

            <p className="text-xs text-slate-500">
              Customize how this product appears in search engines.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">
              Meta Title
            </label>

            <span className="text-xs text-slate-400">
              {metaTitle.length}/160
            </span>
          </div>

          <input
            value={metaTitle}
            onChange={(event) =>
              onMetaTitleChange(event.target.value)
            }
            maxLength={160}
            placeholder="Product SEO title"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">
              Meta Description
            </label>

            <span className="text-xs text-slate-400">
              {metaDescription.length}/300
            </span>
          </div>

          <textarea
            value={metaDescription}
            onChange={(event) =>
              onMetaDescriptionChange(
                event.target.value,
              )
            }
            maxLength={300}
            rows={4}
            placeholder="Describe this product for search engines..."
            className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </section>
  );
}