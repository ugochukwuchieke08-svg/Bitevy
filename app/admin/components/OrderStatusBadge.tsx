type Props = {
  status: string;
};

const styles = {
  pending: "bg-amber-100 text-amber-700",
  preparing: "bg-orange-100 text-orange-700",
  ready: "bg-blue-100 text-blue-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrderStatusBadge({ status }: Props) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[status as keyof typeof styles] ??
        "bg-slate-100 text-slate-700"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}