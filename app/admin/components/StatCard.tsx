import {
  Package,
  Bike,
  Wallet,
  Clock3,
} from "lucide-react";

type Props = {
  title: string;
  value: string;
  color: "orange" | "amber" | "emerald" | "blue";
};

const styles = {
  orange: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    icon: Package,
  },
  amber: {
    bg: "bg-amber-100",
    text: "text-amber-600",
    icon: Clock3,
  },
  emerald: {
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    icon: Bike,
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    icon: Wallet,
  },
};

export default function StatCard({
  title,
  value,
  color,
}: Props) {
  const config = styles[color];
  const Icon = config.icon;

  return (
    <div className="w-full min-w-0 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-5">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-500 sm:text-sm">
            {title}
          </p>

          <h2 className="mt-2 truncate text-xl font-black text-slate-900 sm:text-3xl">
            {value}
          </h2>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 sm:rounded-2xl ${config.bg}`}
        >
          <Icon
            className={config.text}
            size={20}
          />
        </div>
      </div>
    </div>
  );
}