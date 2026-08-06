type Props = {
  status: "pending" | "active" | "rejected";
};

const styles = {
  pending: "bg-amber-100 text-amber-700",
  active: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const labels = {
  pending: "Pending",
  active: "Active",
  rejected: "Rejected",
};

export default function RiderStatusBadge({
  status,
}: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
} 