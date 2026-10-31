export type Product = {
  id: number | string;
  slug: string;
  name: string;
  category: string;
  price: number | null;
  originalPrice: number | null;
  image: string;
  description?: string;
  stock?: number | null;
  active?: boolean;
};

export const categories = [
  {
    slug: "water-controllers",
    name: "Water Controllers",
    image: "https://logindustries.com/wp-content/uploads/2025/11/1.product_1-300x300.png",
  },
  {
    slug: "sanitizer-dispensers",
    name: "Sanitizer Dispensers",
    image: "https://logindustries.com/wp-content/uploads/2026/05/AutoSan-DUal-Toweer-300x300.jpeg",
  },
  {
    slug: "smartphones-security-lock",
    name: "Smartphone Security Lock",
    image: "https://logindustries.com/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-12-at-10.21.06-PM-300x300.jpeg",
  },
  {
    slug: "automatic-hydraulic-door-close",
    name: "Automatic Hydraulic Door Closer",
    image: "https://logindustries.com/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-13-at-10.43.36-AM-600x600.jpeg",
  },
];

export const products: Product[] = [
  {
    id: 1,
    slug: "tank-mate-corporation-water-controller",
    name: "Tank Mate Corporation Water Controller",
    category: "Water Controllers",
    price: 4199,
    originalPrice: 8500,
    image: "https://logindustries.com/wp-content/uploads/2025/11/5.product_5.2-300x300.png",
  },
  {
    id: 2,
    slug: "tank-mate-auto-plus",
    name: "Tank Mate Auto Plus",
    category: "Water Controllers",
    price: 4999,
    originalPrice: 9999,
    image: "https://logindustries.com/wp-content/uploads/2025/11/4.product_4.2-300x300.png",
  },
  {
    id: 3,
    slug: "tank-mate-plus",
    name: "Tank Mate Plus",
    category: "Water Controllers",
    price: 5999,
    originalPrice: 10999,
    image: "https://logindustries.com/wp-content/uploads/2025/11/1.product_1-300x300.png",
  },
  {
    id: 4,
    slug: "tank-mate-pro-2",
    name: "Tank Mate Pro",
    category: "Water Controllers",
    price: 3499,
    originalPrice: 6999,
    image: "https://logindustries.com/wp-content/uploads/2025/11/5.product_5.2-300x300.png",
  },
  {
    id: 5,
    slug: "tank-mate-pro-timer",
    name: "Tank Mate Pro-Timer",
    category: "Water Controllers",
    price: 3499,
    originalPrice: 6999,
    image: "https://logindustries.com/wp-content/uploads/2025/11/6.product_6-300x300.png",
  },
  {
    id: 6,
    slug: "autosan-dual-tower-sanitizer-dispenser",
    name: "AutoSan Dual Tower",
    category: "Sanitizer Dispensers",
    price: 7999,
    originalPrice: 15999,
    image: "https://logindustries.com/wp-content/uploads/2026/05/AutoSan-DUal-Toweer-300x300.jpeg",
  },
  {
    id: 7,
    slug: "floor-standing-hand-sanitizer-dispenser",
    name: "AutoSan Stand Pro",
    category: "Sanitizer Dispensers",
    price: 3499,
    originalPrice: 7999,
    image: "https://logindustries.com/wp-content/uploads/2026/05/WhatsApp-Image-2026-05-13-at-6.56.42-PM-300x300.jpeg",
  },
  {
    id: 8,
    slug: "automatic-floor-standing-sanitizer-dispenser",
    name: "AutoSan Tower Pro",
    category: "Sanitizer Dispensers",
    price: 5999,
    originalPrice: 11999,
    image: "https://logindustries.com/wp-content/uploads/2026/05/AutoSanTOwerr-300x300.jpeg",
  },
  {
    id: 9,
    slug: "wall-mount-hand-sanitizer-dispenser",
    name: "AutoSan Wall Pro",
    category: "Sanitizer Dispensers",
    price: 2499,
    originalPrice: 4999,
    image: "https://logindustries.com/wp-content/uploads/2026/05/AutoSan-Wall-Pro-600x600.png",
  },
  {
    id: 10,
    slug: "smart-lock",
    name: "Smart Lock",
    category: "Smartphone Security Lock",
    price: 3000,
    originalPrice: 6500,
    image: "https://logindustries.com/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-12-at-10.21.06-PM-300x300.jpeg",
  },
  {
    id: 11,
    slug: "automatic-hydraulic-door-closer",
    name: "Automatic Hydraulic Door Closer",
    category: "Automatic Hydraulic Door Closer",
    price: null,
    originalPrice: null,
    image: "https://logindustries.com/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-13-at-10.43.36-AM-600x600.jpeg",
  },
];

export const navItems = [
  { label: "All products", href: "/products" },
  ...categories.map((category) => ({
    label: category.name,
    href: `/products?category=${category.slug}`,
  })),
];

export const stats = [
  { label: "Orders shipped", value: "24.8K" },
  { label: "Satisfaction", value: "96%" },
  { label: "Avg. delivery", value: "2.4 days" },
  { label: "Repeat buyers", value: "74%" },
];

export const testimonials = [
  {
    name: "Ravi Sharma",
    role: "Projects Manager",
    content: "LogIndustries helped us replace old tool supplies with a premium and faster workflow. Delivery and quality were excellent.",
  },
  {
    name: "Anika Mehta",
    role: "Home Renovation Lead",
    content: "The product catalogue is clear, pricing is fair, and the support team is responsive. We ordered twice in a month.",
  },
  {
    name: "Harpreet Singh",
    role: "Industrial Buyer",
    content: "Customer experience feels premium, and the admin dashboard gives us visibility on inventory and sales every day.",
  },
];

export const adminSummary = {
  revenue: "$84,250",
  sales: "1,284",
  orders: "316",
  conversion: "6.8%",
};

export const recentOrders = [
  { id: "#1042", customer: "Aman Verma", total: "$720", status: "Shipped" },
  { id: "#1043", customer: "Kavya Jain", total: "$430", status: "Processing" },
  { id: "#1044", customer: "Rohan Patel", total: "$980", status: "Delivered" },
  { id: "#1045", customer: "Nisha Rao", total: "$260", status: "Pending" },
];

export const userOrders = [
  { id: "#0231", date: "12 Aug 2026", total: "$280", status: "Delivered" },
  { id: "#0245", date: "30 Aug 2026", total: "$540", status: "Shipped" },
  { id: "#0251", date: "05 Sep 2026", total: "$120", status: "Processing" },
];
