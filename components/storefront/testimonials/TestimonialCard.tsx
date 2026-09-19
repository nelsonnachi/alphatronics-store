import { Quote, Star } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  role?: string;
  message: string;
  rating?: number;
}

export function TestimonialCard({
  name,
  role = "Verified Customer",
  message,
  rating = 5,
}: TestimonialCardProps) {
  return (
    <article className="flex min-h-[230px] flex-col justify-center rounded-xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      {/* Quote icon */}
      <Quote className="mb-4 h-7 w-7 text-[#2563EB]" />

      {/* Rating */}
      <div className="mb-3 flex items-center gap-1">
        {Array.from({ length: rating }).map((_, index) => (
          <Star
            key={index}
            className="h-3.5 w-3.5 fill-current text-[#F59E0B]"
          />
        ))}
      </div>

      {/* Testimonial */}
      <p className="text-sm leading-6 text-slate-600">
        "{message}"
      </p>

      {/* Customer */}
      <div className="mt-5">
        <p className="text-sm font-semibold text-[#0B1F3B]">
          {name}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {role}
        </p>
      </div>
    </article>
  );
}