import Link from "next/link";
import { BarChart3, Box, CreditCard, LayoutDashboard, MessageSquareText } from "lucide-react";

const items = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Box },
  { label: "Orders", href: "/admin/orders", icon: CreditCard },
  { label: "Reviews", href: "/admin/reviews", icon: MessageSquareText },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  return (
    <aside className="grid grid-cols-2 gap-1 border-b border-slate-200 pb-3 sm:grid-cols-3 lg:flex lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
      {items.map(({ label, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex min-w-0 items-center gap-2 px-2 py-3 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-slate-950 sm:px-3 lg:w-full lg:gap-3"
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </aside>
  );
}
