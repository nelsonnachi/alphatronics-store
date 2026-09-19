import {
  Headphones,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

const services = [
  {
    title: "Free Shipping",
    description: "On orders over NGN 50,000",
    icon: Truck,
  },
  {
    title: "Easy Returns",
    description: "Within 7 days",
    icon: RotateCcw,
  },
  {
    title: "Secure Payments",
    description: "100% secure checkout",
    icon: ShieldCheck,
  },
  {
    title: "24/7 Support",
    description: "We're here to help",
    icon: Headphones,
  },
];

export function CustomerService() {
  return (
    <section className="bg-white py-4 sm:py-5">
      <div className="mx-auto max-w-360 px-4 sm:px-6">
        <div className="grid grid-cols-4  overflow-hidden rounded-xl  bg-[#F8FAFC]">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="flex items-center justify-center gap-2 px-1 py-4 sm:gap-3 sm:px-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#2563EB] sm:h-10 sm:w-10">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>

                <div className="hidden sm:block">
                  <h3 className="text-sm font-semibold text-[#0F172A]">
                    {service.title}
                  </h3>

                  <p className="mt-0.5 text-xs text-[#64748B]">
                    {service.description}
                  </p>
                </div>

                <div className="text-center sm:hidden">
                  <h3 className="text-[9px] font-semibold leading-tight text-[#0F172A]">
                    {service.title}
                  </h3>

                  <p className="mt-1 text-[7px] leading-tight text-[#64748B]">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}