import { LayoutDashboard, Package, Bike } from "lucide-react";

export const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: Package,
  },
  {
    name: "Riders",
    href: "/admin/riders",
    icon: Bike,
  },
];